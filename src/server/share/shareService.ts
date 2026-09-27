import crypto from "crypto";
import { useSecureShareMongo } from "@/lib/database/useMongo";
import { ShareDocument, ShareFile, StorageStats, ShareListItem, ShareDetailResponse } from "@/types/share";
import { uploadToAllBuckets, generatePresignedDownloadUrl, deleteFromAllBuckets } from "./s3Clients";
import { verifyTurnstileToken } from "@/lib/turnstile";

const MAX_STORAGE_BYTES = 10 * 1024 * 1024;
const MAX_EXPIRY_MINUTES = 120;
const MAX_DOWNLOAD_LIMIT = 10;

async function getCollection() {
    const initDb = await useSecureShareMongo();
    const db = initDb.db("secureShare");
    const collection = db.collection<ShareDocument>("secureShare");
    await collection.dropIndex("expiresAt_1").catch(() => {});
    await collection.createIndex({ expiresAt: 1 }).catch(() => {});
    await collection.createIndex({ purgeAfter: 1 }).catch(() => {});
    await collection.createIndex({ shareId: 1 }, { unique: true }).catch(() => {});
    await collection.createIndex({ creatorUsername: 1 }).catch(() => {});
    await collection.createIndex({ allowedRegNos: 1 }).catch(() => {});
    return collection;
}

function hashPassword(password: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex");
    return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
    const computed = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"));
}

export function generateShareId(): string {
    return crypto.randomBytes(5).toString("hex");
}

export async function getUserActiveStorage(username: string): Promise<StorageStats> {
    const collection = await getCollection();
    const user = username.toUpperCase();
    const now = new Date();

    const activeShares = await collection.find({
        creatorUsername: user,
        expiresAt: { $gt: now }
    }).toArray();

    const usedBytes = activeShares.reduce((acc, s) => acc + (s.totalBytes || 0), 0);
    const remainingBytes = Math.max(0, MAX_STORAGE_BYTES - usedBytes);

    return {
        usedBytes,
        maxBytes: MAX_STORAGE_BYTES,
        remainingBytes,
        activeSharesCount: activeShares.length
    };
}

export async function createShare(params: {
    creatorUsername: string;
    text?: string;
    files: Array<{ name: string; size: number; type: string; buffer: Buffer }>;
    isPublic: boolean;
    allowedRegNos?: string[];
    password?: string;
    maxDownloads?: number;
    expiryMinutes: number;
}): Promise<{ shareId: string; totalBytes: number; expiresAt: Date }> {
    const creator = params.creatorUsername.toUpperCase();
    const textBytes = params.text ? Buffer.byteLength(params.text, "utf8") : 0;
    const filesBytes = params.files.reduce((acc, f) => acc + f.size, 0);
    const totalBytes = textBytes + filesBytes;

    if (totalBytes <= 0) {
        throw new Error("Share cannot be empty. Please provide text or attach files.");
    }

    const stats = await getUserActiveStorage(creator);
    if (stats.usedBytes + totalBytes > MAX_STORAGE_BYTES) {
        throw new Error(`Upload exceeds your 10MB active quota. Available storage: ${(stats.remainingBytes / (1024 * 1024)).toFixed(2)} MB`);
    }

    const minutes = Math.max(1, Math.min(params.expiryMinutes || 120, MAX_EXPIRY_MINUTES));
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    const createdAt = new Date();
    const shareId = generateShareId();

    const parsedRegNos = (params.allowedRegNos || [])
        .map((r) => r.trim().toUpperCase())
        .filter((r) => r.length > 0);

    let passwordHash: string | undefined;
    let passwordSalt: string | undefined;
    const isPasswordProtected = Boolean(params.password && params.password.trim().length > 0);

    if (isPasswordProtected && params.password) {
        const hashed = hashPassword(params.password.trim());
        passwordHash = hashed.hash;
        passwordSalt = hashed.salt;
    }

    const maxDownloads = params.files.length > 0
        ? Math.max(1, Math.min(params.maxDownloads ?? MAX_DOWNLOAD_LIMIT, MAX_DOWNLOAD_LIMIT))
        : 0;

    const fileUploadTasks = params.files.map(async (f) => {
        const fileId = crypto.randomBytes(6).toString("hex");
        const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const s3Key = `${shareId}/${fileId}_${safeName}`;

        await uploadToAllBuckets(s3Key, f.buffer, f.type || "application/octet-stream");

        return {
            fileId,
            name: f.name,
            size: f.size,
            type: f.type,
            s3Key
        };
    });

    const uploadedFiles: ShareFile[] = await Promise.all(fileUploadTasks);

    const document: ShareDocument = {
        shareId,
        creatorUsername: creator,
        text: params.text || "",
        files: uploadedFiles,
        totalBytes,
        isPublic: params.isPublic,
        allowedRegNos: parsedRegNos,
        isPasswordProtected,
        passwordHash,
        passwordSalt,
        maxDownloads,
        remainingDownloads: maxDownloads,
        expiresAt,
        purgeAfter: expiresAt,
        createdAt
    };

    const collection = await getCollection();
    await collection.insertOne(document as any);

    return { shareId, totalBytes, expiresAt };
}

export async function getShareDetails(
    shareId: string,
    currentUser?: { username: string; isAdmin?: boolean },
    password?: string
): Promise<ShareDetailResponse> {
    const collection = await getCollection();
    const doc = await collection.findOne({ shareId });

    if (!doc) {
        throw new Error("Share not found or expired");
    }

    if (new Date() > new Date(doc.expiresAt)) {
        await purgeAndRemoveShare(collection, doc);
        throw new Error("Share has expired");
    }

    const currentUsername = currentUser?.username?.toUpperCase();
    const isOwner = Boolean(currentUsername && currentUsername === doc.creatorUsername);

    if (!doc.isPublic) {
        const isAllowedReg = isOwner || (currentUsername ? (doc.allowedRegNos || []).map((r: string) => r.toUpperCase()).includes(currentUsername) : false);
        if (!isAllowedReg) {
            if (doc.isPasswordProtected) {
                if (!password || !doc.passwordHash || !doc.passwordSalt || !verifyPassword(password, doc.passwordHash, doc.passwordSalt)) {
                    const error: any = new Error("This is a password-protected share. Please enter the password to unlock.");
                    error.code = "INVALID_PASSWORD";
                    throw error;
                }
            } else {
                const error: any = new Error("You do not have access to this private share");
                error.code = "FORBIDDEN";
                throw error;
            }
        }
    }

    let isUnlocked = true;
    if (doc.isPasswordProtected && !isOwner) {
        if (!password) {
            isUnlocked = false;
        } else if (!doc.passwordHash || !doc.passwordSalt || !verifyPassword(password, doc.passwordHash, doc.passwordSalt)) {
            const error: any = new Error("Invalid password for this share");
            error.code = "INVALID_PASSWORD";
            throw error;
        }
    }

    return {
        shareId: doc.shareId,
        creatorUsername: doc.creatorUsername,
        isOwner,
        isPublic: doc.isPublic,
        isPasswordProtected: doc.isPasswordProtected,
        isUnlocked,
        text: isUnlocked ? doc.text : undefined,
        files: isUnlocked && doc.remainingDownloads > 0
            ? doc.files.map((f) => ({
                fileId: f.fileId,
                name: f.name,
                size: f.size,
                type: f.type
            }))
            : [],
        maxDownloads: doc.maxDownloads,
        remainingDownloads: doc.remainingDownloads,
        expiresAt: doc.expiresAt.toISOString(),
        createdAt: doc.createdAt.toISOString()
    };
}

interface DownloadTokenDocument {
    token: string;
    shareId: string;
    fileId: string;
    s3Key: string;
    filename: string;
    username: string;
    used: boolean;
    expiresAt: Date;
    createdAt: Date;
}

async function getTokenCollection() {
    const initDb = await useSecureShareMongo();
    const db = initDb.db("secureShare");
    const collection = db.collection<DownloadTokenDocument>("secureShareTokens");
    await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
    await collection.createIndex({ token: 1 }, { unique: true }).catch(() => {});
    return collection;
}

export async function issuePresignedFileDownload(params: {
    shareId: string;
    fileId: string;
    currentUser: { username: string; isAdmin?: boolean };
    turnstileToken: string;
    password?: string;
    clientIp?: string;
}): Promise<{ downloadUrl: string; filename: string; remainingDownloads: number }> {
    const { shareId, fileId, currentUser, turnstileToken, password, clientIp } = params;

    const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileResult.success) {
        const err: any = new Error(turnstileResult.error || "Turnstile verification failed");
        err.code = "TURNSTILE_FAILED";
        throw err;
    }

    const collection = await getCollection();
    const doc = await collection.findOne({ shareId });

    if (!doc) {
        throw new Error("Share not found or expired");
    }

    if (new Date() > new Date(doc.expiresAt)) {
        await purgeAndRemoveShare(collection, doc);
        throw new Error("Share has expired");
    }

    const currentUsername = currentUser.username.toUpperCase();
    const isOwner = currentUsername === doc.creatorUsername;

    if (!doc.isPublic) {
        const isAllowedReg = isOwner || (Boolean(currentUsername) && (doc.allowedRegNos || []).map((r: string) => r.toUpperCase()).includes(currentUsername));
        if (!isAllowedReg) {
            if (doc.isPasswordProtected) {
                if (!password || !doc.passwordHash || !doc.passwordSalt || !verifyPassword(password, doc.passwordHash, doc.passwordSalt)) {
                    const err: any = new Error("Invalid password for this protected file");
                    err.code = "INVALID_PASSWORD";
                    throw err;
                }
            } else {
                const err: any = new Error("You do not have permission to download files from this private share");
                err.code = "FORBIDDEN";
                throw err;
            }
        }
    }

    if (doc.isPasswordProtected && !isOwner) {
        if (!password || !doc.passwordHash || !doc.passwordSalt || !verifyPassword(password, doc.passwordHash, doc.passwordSalt)) {
            const err: any = new Error("Invalid password for this protected file");
            err.code = "INVALID_PASSWORD";
            throw err;
        }
    }

    const targetFile = doc.files.find((f) => f.fileId === fileId);
    if (!targetFile) {
        throw new Error("Requested file not found in this share");
    }

    if (doc.remainingDownloads <= 0) {
        throw new Error("File download limit reached. File is no longer available.");
    }

    const updateResult = await collection.findOneAndUpdate(
        { shareId, remainingDownloads: { $gt: 0 } },
        { $inc: { remainingDownloads: -1 } },
        { returnDocument: "after" }
    );

    const updatedDoc = updateResult as any;
    if (!updatedDoc) {
        throw new Error("File download limit reached. File is no longer available.");
    }
    const remaining = updatedDoc.remainingDownloads;

    const token = crypto.randomBytes(32).toString("hex");
    const tokenCollection = await getTokenCollection();
    await tokenCollection.insertOne({
        token,
        shareId,
        fileId,
        s3Key: targetFile.s3Key,
        filename: targetFile.name,
        username: currentUsername,
        used: false,
        expiresAt: new Date(Date.now() + 60 * 1000),
        createdAt: new Date()
    });

    if (remaining <= 0) {
        const purgeAfter = new Date(Date.now() + 45 * 1000);
        await collection.updateOne(
            { shareId, remainingDownloads: { $lte: 0 } },
            { $set: { purgeAfter } }
        );
        setTimeout(() => {
            adminPurgeExpiredShares().catch((error) => console.error("Secure Share cleanup failed:", error));
        }, 45 * 1000);
    }

    return {
        downloadUrl: `/api/share/download/${token}`,
        filename: targetFile.name,
        remainingDownloads: Math.max(0, remaining)
    };
}

export async function consumeDownloadToken(token: string): Promise<{ s3PresignedUrl: string; filename: string }> {
    const tokenCollection = await getTokenCollection();
    const now = new Date();

    const result = await tokenCollection.findOneAndUpdate(
        { token, used: false, expiresAt: { $gt: now } },
        { $set: { used: true } },
        { returnDocument: "before" }
    );

    const doc = result as any;
    if (!doc || !doc.s3Key) {
        throw new Error("This one-time download link has already been used or has expired.");
    }

    const s3PresignedUrl = await generatePresignedDownloadUrl(doc.s3Key, doc.filename, 15);
    return { s3PresignedUrl, filename: doc.filename };
}

export async function getUserShares(username: string): Promise<{ myShares: ShareListItem[]; sharedWithMe: ShareListItem[]; storage: StorageStats }> {
    const collection = await getCollection();
    const user = username.toUpperCase();
    const now = new Date();

    const createdDocs = await collection.find({
        creatorUsername: user,
        expiresAt: { $gt: now }
    }).sort({ createdAt: -1 }).toArray();

    const receivedDocs = await collection.find({
        allowedRegNos: user,
        creatorUsername: { $ne: user },
        expiresAt: { $gt: now }
    }).sort({ createdAt: -1 }).toArray();

    const mapItem = (d: ShareDocument, isOwner: boolean): ShareListItem => ({
        shareId: d.shareId,
        creatorUsername: d.creatorUsername,
        hasText: Boolean(d.text && d.text.length > 0),
        textSnippet: d.text ? (d.text.length > 60 ? d.text.slice(0, 60) + "..." : d.text) : undefined,
        filesCount: (d.files || []).length,
        totalBytes: d.totalBytes || 0,
        isPublic: d.isPublic,
        allowedRegNos: d.allowedRegNos || [],
        isPasswordProtected: d.isPasswordProtected,
        maxDownloads: d.maxDownloads || 0,
        remainingDownloads: d.remainingDownloads || 0,
        expiresAt: d.expiresAt.toISOString(),
        createdAt: d.createdAt.toISOString(),
        isOwner
    });

    const usedBytes = createdDocs.reduce((acc, s) => acc + (s.totalBytes || 0), 0);
    const remainingBytes = Math.max(0, MAX_STORAGE_BYTES - usedBytes);

    return {
        myShares: createdDocs.map((d) => mapItem(d, true)),
        sharedWithMe: receivedDocs.map((d) => mapItem(d, false)),
        storage: {
            usedBytes,
            maxBytes: MAX_STORAGE_BYTES,
            remainingBytes,
            activeSharesCount: createdDocs.length
        }
    };
}

export async function deleteShare(shareId: string, currentUser: { username: string; isAdmin?: boolean }): Promise<boolean> {
    const collection = await getCollection();
    const doc = await collection.findOne({ shareId });
    if (!doc) return false;

    const currentUsername = currentUser.username.toUpperCase();
    const isOwner = currentUsername === doc.creatorUsername;
    const isAdminUser = Boolean(currentUser.isAdmin);

    if (!isOwner && !isAdminUser) {
        throw new Error("Unauthorized to delete this share");
    }

    await purgeAndRemoveShare(collection, doc);
    return true;
}

export async function updateShareAccess(
    shareId: string,
    currentUser: { username: string; isAdmin?: boolean },
    params: { isPublic?: boolean; allowedRegNos?: string[] }
): Promise<{ shareId: string; isPublic: boolean; allowedRegNos: string[] }> {
    const collection = await getCollection();
    const doc = await collection.findOne({ shareId });

    if (!doc) {
        throw new Error("Share not found or expired");
    }

    const currentUsername = currentUser.username.toUpperCase();
    const isOwner = currentUsername === doc.creatorUsername;

    if (!isOwner) {
        const err: any = new Error("Only the creator of this share can edit access permissions");
        err.code = "FORBIDDEN";
        throw err;
    }

    const updateFields: any = {};
    if (typeof params.isPublic === "boolean") {
        updateFields.isPublic = params.isPublic;
    }

    if (Array.isArray(params.allowedRegNos)) {
        const parsed = params.allowedRegNos
            .map((r) => r.trim().toUpperCase())
            .filter((r) => r.length > 0 && /^[A-Z0-9_-]+$/.test(r))
            .slice(0, 100);
        updateFields.allowedRegNos = parsed;
    }

    await collection.updateOne({ shareId }, { $set: updateFields });

    return {
        shareId,
        isPublic: updateFields.isPublic !== undefined ? updateFields.isPublic : doc.isPublic,
        allowedRegNos: updateFields.allowedRegNos !== undefined ? updateFields.allowedRegNos : doc.allowedRegNos
    };
}

export async function getLiveNotifications(username: string, sinceSeconds: number = 30): Promise<ShareListItem[]> {
    const collection = await getCollection();
    const user = username.toUpperCase();
    const since = new Date(Date.now() - sinceSeconds * 1000);

    const newReceived = await collection.find({
        allowedRegNos: user,
        creatorUsername: { $ne: user },
        createdAt: { $gte: since },
        expiresAt: { $gt: new Date() }
    }).toArray();

    return newReceived.map((d) => ({
        shareId: d.shareId,
        creatorUsername: d.creatorUsername,
        hasText: Boolean(d.text && d.text.length > 0),
        textSnippet: d.text ? (d.text.length > 60 ? d.text.slice(0, 60) + "..." : d.text) : undefined,
        filesCount: (d.files || []).length,
        totalBytes: d.totalBytes || 0,
        isPublic: d.isPublic,
        allowedRegNos: d.allowedRegNos || [],
        isPasswordProtected: d.isPasswordProtected,
        maxDownloads: d.maxDownloads || 0,
        remainingDownloads: d.remainingDownloads || 0,
        expiresAt: d.expiresAt.toISOString(),
        createdAt: d.createdAt.toISOString(),
        isOwner: false
    }));
}

async function purgeShareFiles(doc: ShareDocument): Promise<void> {
    await deleteFromAllBuckets(`${doc.shareId}/`);
}

async function purgeAndRemoveShare(collection: Awaited<ReturnType<typeof getCollection>>, doc: ShareDocument): Promise<void> {
    await purgeShareFiles(doc);
    await collection.deleteOne({ shareId: doc.shareId });
}

export async function getAllSharesAdmin(): Promise<{
    stats: {
        totalShares: number;
        totalBytes: number;
        totalFiles: number;
        activeShares: number;
        expiredShares: number;
    };
    shares: Array<ShareDocument & { isExpired: boolean }>;
}> {
    const collection = await getCollection();
    const now = new Date();
    const allShares = await collection.find({}).sort({ createdAt: -1 }).toArray();

    let totalBytes = 0;
    let totalFiles = 0;
    let activeShares = 0;
    let expiredShares = 0;

    const mappedShares = allShares.map((s) => {
        const isExpired = now > new Date(s.expiresAt) || s.remainingDownloads <= 0;
        totalBytes += s.totalBytes || 0;
        totalFiles += (s.files || []).length;
        if (isExpired) {
            expiredShares++;
        } else {
            activeShares++;
        }
        return {
            ...s,
            isExpired
        };
    });

    return {
        stats: {
            totalShares: allShares.length,
            totalBytes,
            totalFiles,
            activeShares,
            expiredShares
        },
        shares: mappedShares
    };
}

export async function adminPurgeExpiredShares(): Promise<{ purgedCount: number; failedCount: number }> {
    const collection = await getCollection();
    const now = new Date();
    const expiredDocs = await collection.find({
        $or: [
            { purgeAfter: { $lte: now } },
            { purgeAfter: { $exists: false }, expiresAt: { $lte: now } },
            { purgeAfter: { $exists: false }, remainingDownloads: { $lte: 0 } }
        ]
    }).toArray();

    let purgedCount = 0;
    let failedCount = 0;

    for (const doc of expiredDocs) {
        try {
            await purgeAndRemoveShare(collection, doc);
            purgedCount++;
        } catch {
            failedCount++;
        }
    }

    return { purgedCount, failedCount };
}

export async function adminGenerateFileDownloadUrl(shareId: string, fileId: string): Promise<{ downloadUrl: string; filename: string }> {
    const collection = await getCollection();
    const doc = await collection.findOne({ shareId });
    if (!doc) throw new Error("Share not found");

    const targetFile = doc.files.find((f) => f.fileId === fileId);
    if (!targetFile) throw new Error("File not found in share");

    const downloadUrl = await generatePresignedDownloadUrl(targetFile.s3Key, targetFile.name);
    return { downloadUrl, filename: targetFile.name };
}

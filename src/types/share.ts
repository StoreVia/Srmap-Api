export interface ShareFile {
    fileId: string;
    name: string;
    size: number;
    type: string;
    s3Key: string;
}

export interface ShareDocument {
    _id?: any;
    shareId: string;
    creatorUsername: string;
    text?: string;
    files: ShareFile[];
    totalBytes: number;
    isPublic: boolean;
    allowedRegNos: string[];
    isPasswordProtected: boolean;
    passwordHash?: string;
    passwordSalt?: string;
    maxDownloads: number;
    remainingDownloads: number;
    expiresAt: Date;
    /** The earliest time it is safe to hard-delete the backing B2 objects. */
    purgeAfter: Date;
    createdAt: Date;
}

export interface StorageStats {
    usedBytes: number;
    maxBytes: number;
    remainingBytes: number;
    activeSharesCount: number;
}

export interface ShareListItem {
    shareId: string;
    creatorUsername: string;
    hasText: boolean;
    textSnippet?: string;
    filesCount: number;
    totalBytes: number;
    isPublic: boolean;
    allowedRegNos: string[];
    isPasswordProtected: boolean;
    maxDownloads: number;
    remainingDownloads: number;
    expiresAt: string;
    createdAt: string;
    isOwner: boolean;
}

export interface ShareDetailResponse {
    shareId: string;
    creatorUsername: string;
    isOwner: boolean;
    isPublic: boolean;
    isPasswordProtected: boolean;
    isUnlocked?: boolean;
    text?: string;
    files: Array<{
        fileId: string;
        name: string;
        size: number;
        type: string;
    }>;
    maxDownloads: number;
    remainingDownloads: number;
    expiresAt: string;
    createdAt: string;
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/server/utils/functions";
import { getAllSharesAdmin, deleteShare, adminPurgeExpiredShares, adminGenerateFileDownloadUrl } from "@/server/share/shareService";
import { listBucketFiles, getBucketNames, purgeAllBuckets } from "@/server/share/s3Clients";
import { useSecureShareMongo } from "@/lib/database/useMongo";

export async function GET(req: NextRequest) {
    const auth = await requireAuthResponseAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const url = new URL(req.url);
        const action = url.searchParams.get("action");
        const bucket = url.searchParams.get("bucket");

        if (action === "list-bucket" && bucket) {
            const validBuckets = getBucketNames();
            if (!validBuckets.includes(bucket)) {
                return errorResponse(`Invalid bucket: ${bucket}`, {}, 400);
            }
            const files = await listBucketFiles(bucket);
            return NextResponse.json({
                success: true,
                data: { bucket, files, count: files.length }
            });
        }

        if (action === "bucket-names") {
            return NextResponse.json({
                success: true,
                data: { buckets: getBucketNames() }
            });
        }

        const result = await getAllSharesAdmin();
        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (err: any) {
        console.error(err);
        return errorResponse(err.message || "Failed to retrieve shares", {}, 500);
    }
}

export async function DELETE(req: NextRequest) {
    const auth = await requireAuthResponseAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const url = new URL(req.url);
        const action = url.searchParams.get("action");
        const shareId = url.searchParams.get("shareId");

        if (action === "purge-expired") {
            const res = await adminPurgeExpiredShares();
            return NextResponse.json({
                success: true,
                message: `Purged ${res.purgedCount} expired shares and their files from all 3 databases`,
                data: res
            });
        }

        if (action === "purge-all") {
            const res = await purgeAllBuckets();
            const client = await useSecureShareMongo();
            const db = client.db("secureShare");
            const deleteResult = await db.collection("secureShare").deleteMany({});
            return NextResponse.json({
                success: true,
                message: `Purged all 3 databases. ${res.total} files deleted. ${deleteResult.deletedCount} MongoDB records cleared.`,
                data: { ...res, mongoDeleted: deleteResult.deletedCount }
            });
        }

        if (!shareId) {
            return errorResponse("Share ID is required", {}, 400);
        }

        const success = await deleteShare(shareId, {
            username: auth.payload.username,
            isAdmin: true
        });

        if (!success) {
            return errorResponse("Share not found or already deleted", {}, 404);
        }

        return NextResponse.json({
            success: true,
            message: "Share and all replicated files purged successfully"
        });
    } catch (err: any) {
        console.error(err);
        return errorResponse(err.message || "Failed to delete share", {}, 500);
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAuthResponseAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await req.json().catch(() => ({}));
        const { shareId, fileId } = body;

        if (!shareId || !fileId) {
            return errorResponse("shareId and fileId are required", {}, 400);
        }

        const result = await adminGenerateFileDownloadUrl(shareId, fileId);
        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (err: any) {
        console.error(err);
        return errorResponse(err.message || "Failed to generate admin download link", {}, 500);
    }
}

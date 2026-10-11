import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/server/utils/functions";
import { getAllSharesAdmin } from "@/server/share/shareService";
import { getBucketNames, listBucketFiles } from "@/server/share/s3Clients";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const sharesData = await getAllSharesAdmin();
    const buckets = getBucketNames();
    const bucketCounts: Record<string, number> = {};

    for (const b of buckets) {
      try {
        const files = await listBucketFiles(b);
        bucketCounts[b] = files.length;
      } catch {
        bucketCounts[b] = 0;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalShares: sharesData.stats.totalShares,
        activeShares: sharesData.stats.activeShares,
        expiredShares: sharesData.stats.expiredShares,
        totalBytes: sharesData.stats.totalBytes,
        totalFiles: sharesData.stats.totalFiles,
        bucketCounts,
        buckets
      }
    });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to load secureshare stats", {}, 500);
  }
}

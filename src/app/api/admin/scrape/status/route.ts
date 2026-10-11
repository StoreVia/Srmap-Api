import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin } from "@/server/utils/functions";
import { getScrapeProgress } from "@/server/faculty/scraperService";
import { useSecondaryMongo } from "@/lib/database/useMongo";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const progress = getScrapeProgress();
  let dbFacultyCount = 0;
  let dbStaffCount = 0;
  let lastScrapedMeta = null;

  try {
    const client = await useSecondaryMongo();
    const db = client.db("faculty");
    dbFacultyCount = await db.collection("faculty").countDocuments();
    dbStaffCount = await db.collection("staff").countDocuments();
    lastScrapedMeta = await db.collection("scrape_state").findOne({
      $or: [{ key: "last_scrape" }, { _id: "last_scrape" as any }]
    });
  } catch {}


  return NextResponse.json({
    success: true,
    data: {
      progress,
      dbStats: {
        totalFaculty: dbFacultyCount,
        totalStaff: dbStaffCount,
        lastScrapedAt: lastScrapedMeta?.lastScrapedAt || progress.lastScrapedAt
      }
    }
  });
}

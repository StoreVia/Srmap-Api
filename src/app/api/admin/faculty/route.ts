import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/server/utils/functions";
import { runFacultyAndStaffScrape, getScrapeProgress } from "@/server/faculty/scraperService";
import { generateAllFacultyTimetables, getFacultyTimetableMeta, getFacultyTimetableProgress } from "@/server/faculty/timetableService";
import { useSecondaryMongo } from "@/lib/database/useMongo";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const client = await useSecondaryMongo();
    const db = client.db("faculty");

    const [dbFacultyCount, dbStaffCount, lastScrapedMeta, totalRatingsCount, ratedFacultyCount, timetableMeta] = await Promise.all([
      db.collection("faculty").countDocuments(),
      db.collection("staff").countDocuments(),
      db.collection("scrape_state").findOne({
        $or: [{ key: "last_scrape" }, { _id: "last_scrape" as any }]
      }),
      db.collection("faculty_ratings").countDocuments(),
      db.collection("faculty").countDocuments({ ratingSummary: { $exists: true, $ne: null } }),
      getFacultyTimetableMeta()
    ]);

    const scraperProgress = getScrapeProgress();
    const timetableProgress = getFacultyTimetableProgress();

    return NextResponse.json({
      success: true,
      data: {
        scraper: {
          progress: scraperProgress,
          dbStats: {
            totalFaculty: dbFacultyCount,
            totalStaff: dbStaffCount,
            lastScrapedAt: lastScrapedMeta?.lastScrapedAt || scraperProgress.lastScrapedAt
          }
        },
        timetables: {
          meta: timetableMeta,
          progress: timetableProgress
        },
        ratings: {
          totalRatings: totalRatingsCount,
          ratedFacultyCount
        }
      }
    });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to load faculty admin data", {}, 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const action = body.action || url.searchParams.get("action");

    if (action === "scrape") {
      const current = getScrapeProgress();
      if (current.inProgress) {
        return errorResponse("Scrape already in progress", { progress: current }, 409);
      }
      runFacultyAndStaffScrape().catch(() => {});
      return NextResponse.json({
        success: true,
        message: "Faculty and staff scraper started",
        data: getScrapeProgress()
      });
    }

    if (action === "timetables") {
      const current = getFacultyTimetableProgress();
      if (current.inProgress) {
        return errorResponse("Timetable generation is already in progress", { progress: current }, 409);
      }
      generateAllFacultyTimetables().catch(() => {});
      return NextResponse.json({
        success: true,
        message: "Faculty timetable generation process initiated",
        data: getFacultyTimetableProgress()
      });
    }

    if (action === "reset-ratings") {
      const client = await useSecondaryMongo();
      const db = client.db("faculty");
      const delRes = await db.collection("faculty_ratings").deleteMany({});
      const updateRes = await db.collection("faculty").updateMany({}, { $unset: { ratingSummary: "" } });
      return NextResponse.json({
        success: true,
        message: `Reset ${delRes.deletedCount} ratings across ${updateRes.modifiedCount} faculty records.`,
        data: { deletedCount: delRes.deletedCount, modifiedCount: updateRes.modifiedCount }
      });
    }

    return errorResponse("Invalid action. Must be 'scrape', 'timetables', or 'reset-ratings'", {}, 400);
  } catch (err: any) {
    return errorResponse(err.message || "Action failed", {}, 500);
  }
}
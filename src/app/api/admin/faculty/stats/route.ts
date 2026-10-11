import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/server/utils/functions";
import { useSecondaryMongo } from "@/lib/database/useMongo";
import { getFacultyTimetableMeta, getFacultyTimetableProgress } from "@/server/faculty/timetableService";
import { getScrapeProgress } from "@/server/faculty/scraperService";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const client = await useSecondaryMongo();
    const db = client.db("faculty");

    const [totalFaculty, totalStaff, totalRatings, ratedFacultyCount, timetableMeta] = await Promise.all([
      db.collection("faculty").countDocuments(),
      db.collection("staff").countDocuments(),
      db.collection("faculty_ratings").countDocuments(),
      db.collection("faculty").countDocuments({ ratingSummary: { $exists: true, $ne: null } }),
      getFacultyTimetableMeta()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalFaculty,
        totalStaff,
        totalRatings,
        ratedFacultyCount,
        timetableMeta,
        scraperProgress: getScrapeProgress(),
        timetableProgress: getFacultyTimetableProgress()
      }
    });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to load faculty stats", {}, 500);
  }
}

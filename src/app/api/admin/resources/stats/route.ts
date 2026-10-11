import { NextRequest, NextResponse } from "next/server";
import { useMongo } from "@/lib/database/useMongo";
import { requireAuthResponseAdmin, errorResponse } from "@/server/utils/functions";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const initDb = await useMongo();
    const db = initDb.db("resources");

    const [totalCourses, totalSubjects, totalResources, totalYears] = await Promise.all([
      db.collection("courses").countDocuments(),
      db.collection("subjects").countDocuments(),
      db.collection("resources").countDocuments(),
      db.collection("years").countDocuments()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalCourses,
        totalSubjects,
        totalResources,
        totalYears
      }
    });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to load resource stats", {}, 500);
  }
}

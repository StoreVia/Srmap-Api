import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/server/utils/functions";
import { generateAllFacultyTimetables, getFacultyTimetableMeta } from "@/server/faculty/timetableService";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const meta = await getFacultyTimetableMeta();
    return NextResponse.json({ success: true, data: meta });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to fetch timetable status", {}, 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await generateAllFacultyTimetables();
    return NextResponse.json({
      success: true,
      message: `Generated timetables for ${result.count} faculty from ${result.processedTimetables} student schedules`,
      data: result
    });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to generate faculty timetables", {}, 500);
  }
}

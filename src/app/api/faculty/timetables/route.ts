import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";
import { matchFacultyTimetables, getFacultyTimetableBySlug, searchFacultyTimetables } from "@/server/faculty/timetableService";

export async function POST(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const facultyNames = Array.isArray(body?.facultyNames) ? body.facultyNames : [];
    const results = await matchFacultyTimetables(facultyNames);
    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to match faculty timetables", {}, 500);
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const query = searchParams.get("query");

    if (slug) {
      const record = await getFacultyTimetableBySlug(slug);
      if (!record) {
        return errorResponse("Faculty timetable not found", {}, 404);
      }
      return NextResponse.json({ success: true, data: record });
    }

    const records = await searchFacultyTimetables(query || "", 30);
    return NextResponse.json({ success: true, data: records });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to fetch faculty timetable", {}, 500);
  }
}

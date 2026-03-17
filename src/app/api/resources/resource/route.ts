import { NextRequest, NextResponse } from "next/server";
import resourcesData from "@/jsons/resources/resource.json";
import { PARAMETERS } from "@/fullStackUtils/utils/messages";
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const course = searchParams.get('course');
    const year = searchParams.get('year');
    const subjectId = searchParams.get('subjectId');

    if (!course || !year || !subjectId) {
      return errorResponse(PARAMETERS);
    }

    const courseData = resourcesData[course as keyof typeof resourcesData];
    if (!courseData) {
      return NextResponse.json({ success: false, error: "Course Not Found!" }, { status: 404 });
    }

    const yearData = courseData[year as keyof typeof courseData];
    if (!yearData) {
      return NextResponse.json({ success: false, error: "Year Not Found For This Course!" }, { status: 404 });
    }

    const subjectData = yearData[subjectId as keyof typeof yearData];
    if (!subjectData) {
      return NextResponse.json({ success: false, error: "Subject Not Found!" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: subjectData });
  } catch (err) {
    console.log("Error From /api/resources/resource:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}
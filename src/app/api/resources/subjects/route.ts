import { NextRequest, NextResponse } from "next/server";
import subjectsData from "@/static/resources/subjects.json";
import { PARAMETERS } from "@/shared/utils/messages";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";

export async function GET(req: NextRequest) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { searchParams } = new URL(req.url);
        const course = searchParams.get('course');
        const year = searchParams.get('year');

        if (!course || !year) {
            return errorResponse(PARAMETERS);
        }

        const courseData = subjectsData[course as keyof typeof subjectsData];
        if (!courseData) {
            return NextResponse.json({ success: false, error: "Course Not Found!" }, { status: 404 });
        }

        const yearData = courseData[year as keyof typeof courseData];
        if (!yearData) {
            return NextResponse.json({ success: false, error: "Year Not Found For This Course!" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: yearData });
    } catch (err) {
        console.log("Error From /api/resources/subjects:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}
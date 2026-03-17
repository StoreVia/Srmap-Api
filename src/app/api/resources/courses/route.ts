import { NextRequest, NextResponse } from "next/server";
import coursesData from "@/jsons/resources/courses.json";
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions";

export async function GET(req: NextRequest) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { searchParams } = new URL(req.url);
        const year = searchParams.get('year');

        if (!year) {
            return NextResponse.json({ success: false, error: "Year parameter is required" }, { status: 400 });
        }

        const yearData = coursesData[year as keyof typeof coursesData];
        if (!yearData) {
            return NextResponse.json({ success: false, error: "Year not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: yearData });
    } catch (err) {
        console.log("Error From /api/resources/courses:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}
import { NextRequest, NextResponse } from "next/server";
import { useMongo } from "@/lib/database/useMongo";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");

    if (!year) {
      return NextResponse.json({ success: false, error: "Year parameter is required" }, { status: 400 });
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const coursesCollection = db.collection("courses");
    const courses = await coursesCollection.find({ year }).toArray();

    const yearData: Record<string, { name: string; code: string }> = {};
    for (const course of courses) {
      yearData[course.code] = {
        name: course.name,
        code: course.code,
      };
    }

    return NextResponse.json({ success: true, data: yearData });
  } catch (err) {
    console.log("Error From /api/resources/courses:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}
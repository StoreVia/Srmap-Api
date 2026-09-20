import { NextRequest, NextResponse } from "next/server";
import { useMongo } from "@/lib/database/useMongo";
import { PARAMETERS } from "@/shared/utils/messages";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const course = searchParams.get("course");
    const year = searchParams.get("year");

    if (!course || !year) {
      return errorResponse(PARAMETERS);
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const subjectsCollection = db.collection("subjects");

    const subjects = await subjectsCollection
      .find({
        courseCode: course.toUpperCase(),
        year,
      })
      .sort({ code: 1 })
      .toArray();

    const data = subjects.map((sub) => ({
      id: sub._id.toString(),
      code: sub.code,
      name: sub.name,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.log("Error From /api/resources/subjects:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}
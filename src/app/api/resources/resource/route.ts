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
    const subjectId = searchParams.get("subjectId");

    if (!course || !year || !subjectId) {
      return errorResponse(PARAMETERS);
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const resourcesCollection = db.collection("resources");

    const resources = await resourcesCollection
      .find({
        subjectId: String(subjectId),
      })
      .toArray();

    const midPapers = resources
      .filter((r) => r.category === "previousYearPapers" && r.examType === "mid")
      .map((r) => ({
        id: r._id.toString(),
        title: r.title,
        size: r.size,
        type: r.fileType,
        downloadUrl: r.downloadUrl,
      }));

    const semPapers = resources
      .filter((r) => r.category === "previousYearPapers" && r.examType === "sem")
      .map((r) => ({
        id: r._id.toString(),
        title: r.title,
        size: r.size,
        type: r.fileType,
        downloadUrl: r.downloadUrl,
      }));

    const slides = resources
      .filter((r) => r.category === "slidesAndNotes")
      .map((r) => ({
        id: r._id.toString(),
        title: r.title,
        size: r.size,
        type: r.fileType,
        downloadUrl: r.downloadUrl,
      }));

    return NextResponse.json({
      success: true,
      data: {
        previousYearPapers: {
          mid: midPapers,
          sem: semPapers,
        },
        slidesAndNotes: slides,
      },
    });
  } catch (err) {
    console.log("Error From /api/resources/resource:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}
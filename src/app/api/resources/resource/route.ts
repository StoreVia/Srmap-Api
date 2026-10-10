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
    const subjectCode = searchParams.get("subjectCode");

    if (!course || !year || !subjectCode) {
      return errorResponse(PARAMETERS);
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const resourcesCollection = db.collection("resources");

    const trimmedCode = String(subjectCode).trim();
    const resources = await resourcesCollection
      .find({
        subjectCode: { $regex: new RegExp(`^${trimmedCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
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
      .filter((r) => r.category === "previousYearPapers" && (r.examType === "sem" || r.examType === "end"))
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

    const deduplicate = (items: Array<{ id: string; title: string; size: string; type: string; downloadUrl: string }>) => {
      const seen = new Set<string>();
      return items.filter((item) => {
        const key = `${item.title.toLowerCase().trim()}_${item.size.toLowerCase().trim()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    return NextResponse.json({
      success: true,
      data: {
        previousYearPapers: {
          mid: deduplicate(midPapers),
          sem: deduplicate(semPapers),
        },
        slidesAndNotes: deduplicate(slides),
      },
    });
  } catch (err) {
    console.log("Error From /api/resources/resource:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}
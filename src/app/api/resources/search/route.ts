import { NextRequest, NextResponse } from "next/server";
import { useMongo } from "@/lib/database/useMongo";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({ success: true, data: [] });
    }

    const initDb = await useMongo();
    const db = initDb.db("resources");
    const subjectsCollection = db.collection("subjects");

    const tokens = query.split(/\s+/).filter(Boolean);
    const tokenFilters = tokens.map((token) => {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return {
        $or: [
          { code: { $regex: escaped, $options: "i" } },
          { name: { $regex: escaped, $options: "i" } },
        ],
      };
    });

    const subjects = await subjectsCollection
      .find(tokenFilters.length > 1 ? { $and: tokenFilters } : tokenFilters[0])
      .limit(25)
      .toArray();

    const data = subjects.map((sub) => ({
      id: sub._id.toString(),
      code: sub.code,
      name: sub.name,
      courseCode: sub.courseCode,
      year: sub.year,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.log("Error From /api/resources/search:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}
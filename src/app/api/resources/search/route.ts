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
      .limit(50)
      .toArray();

    const getPriority = (sub: any) => {
      const cCode = (sub.courseCode || "").toUpperCase();
      const sCode = (sub.code || "").toUpperCase();
      if (sCode.startsWith("CSE") || cCode === "CSE") return 3;
      if (cCode.startsWith("CSE")) return 2;
      return 1;
    };

    const sortedSubjects = [...subjects].sort((a, b) => {
      const pA = getPriority(a);
      const pB = getPriority(b);
      if (pA !== pB) return pB - pA;
      return (a.code || "").localeCompare(b.code || "");
    });

    const data = sortedSubjects.map((sub) => ({
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
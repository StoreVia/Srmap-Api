import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse } from "@/backendUtils/utils/functions";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const initDb = await useMongo();
    const db = initDb.db("forums");
    const categoriesCollection = db.collection("categories");

    const categories = await categoriesCollection
      .find({})
      .sort({ name: 1 })
      .project({ name: 1 })
      .toArray();

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Error From /api/forums/categories:- ", error);
    return NextResponse.json({ success: false, error: (error as Error).message}, { status: 500 });
  }
}
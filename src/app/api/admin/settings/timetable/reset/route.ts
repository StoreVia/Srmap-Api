import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { errorResponse, requireAuthResponseAdmin } from "@/server/utils/functions";

export async function POST(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const collection = (await useMongo()).db("college_db").collection("empty_classes");
    const result = await collection.deleteMany({});
    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error resetting collected timetables:", error);
    return errorResponse(undefined, {}, 500);
  }
}
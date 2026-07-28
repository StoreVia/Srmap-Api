import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { errorResponse, requireAuthResponseAdmin } from "@/server/utils/functions";

export async function POST(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const db = (await useMongo()).db("college_db").collection("settings");
    const setting = await db.findOne({ id: "app-settings" });
    const timetableCollection = !(setting?.timetableCollection ?? true);
    await db.updateOne({ id: "app-settings" }, { $set: { timetableCollection } }, { upsert: true });
    return NextResponse.json({ success: true, timetableCollection });
  } catch (error) {
    console.error("Error toggling timetable collection:", error);
    return errorResponse(undefined, {}, 500);
  }
}
import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { errorResponse, requireAuthResponseAdmin } from "@/server/utils/functions";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ type: string }> }
) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { type } = await props.params;

  try {
    const db = (await useMongo()).db("college_db").collection("settings");
    const setting = await db.findOne({ id: "app-settings" });

    if (type === "feedback") {
      const feedback = !(setting?.feedback ?? false);
      await db.updateOne(
        { id: "app-settings" },
        { $set: { feedback } },
        { upsert: true }
      );
      return NextResponse.json({ success: true, feedback });
    }

    if (type === "timetable") {
      const timetableCollection = !(setting?.timetableCollection ?? true);
      await db.updateOne(
        { id: "app-settings" },
        { $set: { timetableCollection } },
        { upsert: true }
      );
      return NextResponse.json({ success: true, timetableCollection });
    }

    return errorResponse("Invalid setting type", {}, 400);
  } catch (error) {
    console.error(`Error toggling ${type} setting:`, error);
    return errorResponse(undefined, {}, 500);
  }
}
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
    const mongo = await useMongo();
    const collegeDb = mongo.db("college_db");

    if (type === "feedback") {
      await collegeDb.collection("settings").updateOne(
        { id: "feedback" },
        { $set: { count: 0 } },
        { upsert: true }
      );
      return NextResponse.json({ success: true });
    }

    if (type === "timetable") {
      const collection = collegeDb.collection("empty_classes");
      const result = await collection.deleteMany({});
      return NextResponse.json({ success: true, deletedCount: result.deletedCount });
    }

    return errorResponse("Invalid setting type", {}, 400);
  } catch (error) {
    console.error(`Error resetting ${type} setting:`, error);
    return errorResponse(undefined, {}, 500);
  }
}
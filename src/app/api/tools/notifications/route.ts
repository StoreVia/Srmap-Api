import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const initDb = await useMongo();
    const db = initDb.db('college_db').collection("notifications");
    const notifications = await db.find({}, { projection: { _id: 0, notificationBy: 0 } }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ success: true, notifications });
  } catch (err) {
    console.log("Error From /api/admin/details:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}
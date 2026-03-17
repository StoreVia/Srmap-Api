import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { PARAMETERS, UNAUTHORIZED } from "@/fullStackUtils/utils/messages";
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions";

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  let { reason } = body;

  if (!reason) {
    return errorResponse(PARAMETERS);
  }

  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const initDb = await useMongo();
    const db = initDb.db('college_db').collection("users1");
    const user = await db.findOne({ username: auth.payload.username });

    if (!user) {
      return errorResponse(UNAUTHORIZED);
    }

    await db.deleteOne({ username: auth.payload.username });
    return NextResponse.json({ success: true, message: "Data Deleted Successfully!" });
  } catch (err) {
    console.log("Error From /api/auth/delete:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}
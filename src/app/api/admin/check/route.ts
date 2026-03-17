import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/backendUtils/utils/functions";

export async function GET(req: NextRequest) {

  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    return NextResponse.json({ success: true, message: "Admin Verified!", admin: true });
  } catch (err) {
    console.log("Error From /api/admin/check:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}
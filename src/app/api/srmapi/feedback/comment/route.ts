import { NextRequest, NextResponse } from "next/server";
import getRandomFeedback from "@/backendUtils/srmapi/feedback";
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    return NextResponse.json({ success: true, message: "Success!", comment: getRandomFeedback() });
  } catch (err) {
    console.log("Error From /api/tools/comments:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}
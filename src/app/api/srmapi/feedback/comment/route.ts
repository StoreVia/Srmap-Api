import { NextRequest, NextResponse } from "next/server";
import getRandomFeedback from "@/server/srmapi/feedback/feedbackComments";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";

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
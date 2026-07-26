import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";
import { PARAMETERS } from "@/shared/utils/messages";
import { getExamLedgerForUser } from "@/server/srmapi/exams/getExamLedger";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId } = body;

  if (!sessionId) {
    return errorResponse(PARAMETERS);
  }

  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { data, error } = await getExamLedgerForUser({
      username: auth.payload.username,
      sessionId,
    });

    if (error) {
      return errorResponse(error.message, error.data ?? {}, error.status ?? 400);
    }

    return NextResponse.json({ success: true, message: "Success!", semester_results: data });
  } catch (err) {
    console.log("Error From /api/srmapi/exams/semester-results:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}

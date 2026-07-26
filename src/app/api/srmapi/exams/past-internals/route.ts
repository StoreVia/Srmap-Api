import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";
import { PARAMETERS } from "@/shared/utils/messages";
import { getPastInternalsForUser } from "@/server/srmapi/exams/getPastInternals";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, semester } = body;

  if (!sessionId) {
    return errorResponse(PARAMETERS);
  }

  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { data, error } = await getPastInternalsForUser({
      username: auth.payload.username,
      sessionId,
      semester,
    });

    if (error) {
      return errorResponse(error.message, error.data ?? {}, error.status ?? 400);
    }

    return NextResponse.json({ success: true, message: "Success!", past_internals: data });
  } catch (err) {
    console.log("Error From /api/srmapi/exams/past-internals:- ", err);
    return errorResponse(undefined, {}, 500);
  }
}

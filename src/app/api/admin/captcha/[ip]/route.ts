import { NextRequest, NextResponse } from "next/server";
import { setCaptchaIpBlocked } from "@/server/captcha/captchaAdmin";
import { requireAuthResponseAdmin } from "@/server/utils/functions";

export async function PATCH(request: NextRequest, context: { params: Promise<{ ip: string }> }) {
  const auth = await requireAuthResponseAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { ip } = await context.params;
    const body = await request.json();
    if (typeof body.blocked !== "boolean") {
      return NextResponse.json({ success: false, message: "Choose whether this IP should be blocked." }, { status: 400 });
    }
    const updated = await setCaptchaIpBlocked(decodeURIComponent(ip), body.blocked, auth.payload.username);
    if (!updated) return NextResponse.json({ success: false, message: "Enter a valid IP address." }, { status: 400 });
    return NextResponse.json({ success: true, blocked: body.blocked });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to update this IP." }, { status: 500 });
  }
}
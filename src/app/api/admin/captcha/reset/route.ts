import { NextRequest, NextResponse } from "next/server";
import { resetCaptchaApiStats, resetCaptchaSelfStats } from "@/server/captcha/captchaAdmin";
import { requireAuthResponseAdmin } from "@/server/utils/functions";

export async function POST(request: NextRequest) {
  const auth = await requireAuthResponseAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    if (body.scope === "api") await resetCaptchaApiStats();
    else if (body.scope === "self") await resetCaptchaSelfStats();
    else return NextResponse.json({ success: false, message: "Choose which captcha statistics to reset." }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to reset captcha statistics." }, { status: 500 });
  }
}

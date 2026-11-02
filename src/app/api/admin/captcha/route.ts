import { NextRequest, NextResponse } from "next/server";
import { getCaptchaAdminData, setCaptchaEnabled } from "@/server/captcha/captchaAdmin";
import { requireAuthResponseAdmin } from "@/server/utils/functions";

export async function GET(request: NextRequest) {
  const auth = await requireAuthResponseAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    return NextResponse.json({ success: true, ...(await getCaptchaAdminData()) });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to load captcha admin data." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuthResponseAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json({ success: false, message: "Choose whether captcha solving is enabled." }, { status: 400 });
    }
    const result = await setCaptchaEnabled(body.enabled, auth.payload.username);
    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to update captcha setting." }, { status: 500 });
  }
}
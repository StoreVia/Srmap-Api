import { NextRequest, NextResponse } from "next/server";
import { solveCaptcha } from "@/lib/captcha";
import { getCaptchaClientIp, recordCaptchaRequest } from "@/server/captcha/captchaAdmin";

export async function POST(request: NextRequest) {
  let access: { enabled: boolean; blocked: boolean };
  try {
    access = await recordCaptchaRequest(getCaptchaClientIp(request));
  } catch {
    return NextResponse.json({ error: "Captcha service is temporarily unavailable." }, { status: 503 });
  }

  if (access.blocked) {
    return NextResponse.json({ error: "Captcha service is unavailable for this connection." }, { status: 403 });
  }

  if (!access.enabled) {
    return NextResponse.json({ error: "Captcha solving is temporarily unavailable." }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Please provide a captcha image." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const solvedText = await solveCaptcha(buffer);

    if (!solvedText) {
      return NextResponse.json({ error: "Unable to solve this captcha image." }, { status: 500 });
    }

    return new NextResponse(solvedText, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch {
    console.error("Captcha solve request failed.");
    return NextResponse.json({ error: "Captcha service is temporarily unavailable." }, { status: 502 });
  }
}

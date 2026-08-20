import { NextRequest, NextResponse } from "next/server";
import { solveCaptcha } from "@/lib/captcha";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const solvedText = await solveCaptcha(buffer);

    if (!solvedText) {
      return NextResponse.json(
        { error: "Captcha solving failed" },
        { status: 500 }
      );
    }

    return new NextResponse(solvedText, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Captcha solve error:", message);
    return NextResponse.json(
      { error: "Captcha solver unreachable", detail: message },
      { status: 502 }
    );
  }
}
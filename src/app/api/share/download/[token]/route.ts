import { NextRequest, NextResponse } from "next/server";
import { consumeDownloadToken } from "@/server/share/shareService";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await params;

        if (!token) {
            return new NextResponse(
                "<html><body style='font-family:sans-serif;text-align:center;padding:50px;'><h2>Invalid Download Link</h2><p>The download token is missing.</p></body></html>",
                { status: 400, headers: { "Content-Type": "text/html" } }
            );
        }

        const { s3PresignedUrl } = await consumeDownloadToken(token);
        
        return NextResponse.redirect(s3PresignedUrl, { status: 302 });
    } catch (err: any) {
        return new NextResponse(
            `<html><body style='font-family:sans-serif;text-align:center;padding:50px;background:#0d1117;color:#c9d1d9;'>
                <div style='max-width:450px;margin:0 auto;border:1px solid #30363d;padding:30px;border-radius:12px;background:#161b22;'>
                    <h2 style='color:#f85149;margin-top:0;'>Link Expired or Already Used</h2>
                    <p style='font-size:14px;color:#8b949e;'>${err.message || "This one-time download link has already been used and is no longer valid."}</p>
                    <p style='font-size:12px;color:#8b949e;margin-top:20px;'>For security, download links are single-use only. Please go back to the Secure Share page and request a new download.</p>
                </div>
            </body></html>`,
            { status: 410, headers: { "Content-Type": "text/html" } }
        );
    }
}
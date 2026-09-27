import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse, isAdmin } from "@/server/utils/functions";
import { issuePresignedFileDownload } from "@/server/share/shareService";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { id: shareId } = await params;
        const body = await req.json().catch(() => ({}));
        const { fileId, turnstileToken, password } = body;

        if (!fileId) {
            return errorResponse("File ID is required", {}, 400);
        }

        if (!turnstileToken) {
            return errorResponse("Cloudflare Turnstile verification is required to download files", {}, 400);
        }

        const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;

        const result = await issuePresignedFileDownload({
            shareId,
            fileId,
            currentUser: {
                username: auth.payload.username,
                isAdmin: isAdmin(auth.payload.username)
            },
            turnstileToken,
            password: password ? String(password).trim() : undefined,
            clientIp
        });

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (err: any) {
        if (err.code === "TURNSTILE_FAILED") {
            return errorResponse(err.message || "Turnstile verification failed", {}, 400);
        }
        if (err.code === "FORBIDDEN") {
            return errorResponse(err.message || "You do not have permission to download this file", {}, 403);
        }
        if (err.code === "INVALID_PASSWORD") {
            return errorResponse(err.message || "Incorrect file password", {}, 401);
        }
        return errorResponse(err.message || "Download failed", {}, 400);
    }
}

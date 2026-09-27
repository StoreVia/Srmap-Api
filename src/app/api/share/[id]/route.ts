import { NextRequest, NextResponse } from "next/server";
import { validUser } from "@/server/auth/verifyUser";
import { requireAuthResponse, errorResponse, isAdmin } from "@/server/utils/functions";
import { getShareDetails, deleteShare, updateShareAccess } from "@/server/share/shareService";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: shareId } = await params;
        const { valid, payload } = await validUser(req);
        const currentUser = valid && payload ? { username: payload.username, isAdmin: isAdmin(payload.username) } : undefined;

        const url = new URL(req.url);
        const password = url.searchParams.get("password") || req.headers.get("x-share-password") || undefined;

        const details = await getShareDetails(shareId, currentUser, password);
        return NextResponse.json({
            success: true,
            data: details
        });
    } catch (err: any) {
        if (err.code === "FORBIDDEN") {
            return errorResponse(err.message || "Access denied to private share", {}, 403);
        }
        if (err.code === "INVALID_PASSWORD") {
            return errorResponse(err.message || "Invalid password", { isPasswordProtected: true, isUnlocked: false }, 401);
        }
        return errorResponse(err.message || "Share not found or expired", {}, 404);
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { id: shareId } = await params;
        const body = await req.json().catch(() => ({}));
        const { isPublic, allowedRegNos } = body;

        const result = await updateShareAccess(
            shareId,
            {
                username: auth.payload.username,
                isAdmin: isAdmin(auth.payload.username)
            },
            {
                isPublic: typeof isPublic === "boolean" ? isPublic : undefined,
                allowedRegNos: Array.isArray(allowedRegNos) ? allowedRegNos : undefined
            }
        );

        return NextResponse.json({
            success: true,
            message: "Share access updated successfully",
            data: result
        });
    } catch (err: any) {
        if (err.code === "FORBIDDEN") {
            return errorResponse(err.message || "Unauthorized to edit this share", {}, 403);
        }
        return errorResponse(err.message || "Failed to update share access", {}, 400);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { id: shareId } = await params;
        const success = await deleteShare(shareId, {
            username: auth.payload.username,
            isAdmin: isAdmin(auth.payload.username)
        });

        if (!success) {
            return errorResponse("Share not found or already deleted", {}, 404);
        }

        return NextResponse.json({
            success: true,
            message: "Share deleted successfully"
        });
    } catch (err: any) {
        return errorResponse(err.message || "Failed to delete share", {}, 400);
    }
}

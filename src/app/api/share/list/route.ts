import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";
import { getUserShares } from "@/server/share/shareService";

export async function GET(req: NextRequest) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const shares = await getUserShares(auth.payload.username);
        return NextResponse.json({
            success: true,
            data: shares
        });
    } catch (err: any) {
        console.error(err);
        return errorResponse(err.message || "Failed to retrieve shares list", {}, 500);
    }
}
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";
import { getUserActiveStorage } from "@/server/share/shareService";

export async function GET(req: NextRequest) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const stats = await getUserActiveStorage(auth.payload.username);
        return NextResponse.json({
            success: true,
            data: stats
        });
    } catch (err: any) {
        console.error(err);
        return errorResponse(err.message || "Failed to retrieve storage stats", {}, 500);
    }
}

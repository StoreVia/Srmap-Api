import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";
import { getLiveNotifications } from "@/server/share/shareService";

export async function GET(req: NextRequest) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const url = new URL(req.url);
        const since = Number(url.searchParams.get("since")) || 30;
        const items = await getLiveNotifications(auth.payload.username, since);
        return NextResponse.json({
            success: true,
            data: items
        });
    } catch (err: any) {
        console.error(err);
        return errorResponse(err.message || "Failed to fetch notifications", {}, 500);
    }
}
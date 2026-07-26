import { handleUserSession } from "@/server/auth/handleUserSession";
import { errorResponse, requireAuthResponse } from "@/server/utils/functions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const result = await handleUserSession({ username: auth.payload.username, password: auth.payload.password });

        if (!result.success) {
            return errorResponse(result.message);
        }

        return NextResponse.json({ 
            success: true, 
            message: "Success!", 
            sessionId: result.sessionId,
            sessionTime: result.sessionTime
        });
    } catch (err) {
        console.log("Error From initiate/session:", err);
        return errorResponse(undefined, {}, 500);
    }
}
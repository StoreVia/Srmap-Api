import { NextRequest, NextResponse } from "next/server";
import { isValidRegNumber } from "@/validators/auth/login";
import { handleUserSession } from "@/server/auth/handleUserSession";
import { userBlockedResponse, paramatersNotMatched } from "@/server/utils/responses";
import { createToken, errorResponse, isAdmin, isBlocked } from "@/server/utils/functions";

export async function POST(req: NextRequest) {
    const body = await req.json();
    let { username, password, wantCachedData } = body;

    username = username?.toUpperCase() || "";

    if (!username || !password) {
        return paramatersNotMatched();
    }

    const [isValid, errorMessage] = isValidRegNumber(username);
    if (!isValid) {
        return errorResponse(errorMessage || "Invalid Username!");
    }

    try {
        if (await isBlocked(username)) return userBlockedResponse();

        const result = await handleUserSession({ username, password });

        if (!result.success) {
            if ((result as any).hasCachedData) {
                if (wantCachedData) {
                    const accessToken = createToken({ username, password, admin: isAdmin(username) });
                    return NextResponse.json({
                        success: true,
                        message: "Success (Cached)",
                        accessToken,
                        sessionId: "", 
                        sessionTime: (result as any).cachedSessionTime,
                        hasCachedData: true
                    });
                } else {
                    return errorResponse(result.message, { hasCachedData: true }, 400);
                }
            }
            return errorResponse(result.message);
        }

        const accessToken = createToken({ username, password, admin: isAdmin(username) });

        return NextResponse.json({
            success: true,
            message: "Success!",
            accessToken,
            sessionId: result.sessionId,
            sessionTime: result.sessionTime,
        });
    } catch (err) {
        console.log("Error From /api/auth/login:", err);
        return errorResponse(undefined, {}, 500);
    }
}
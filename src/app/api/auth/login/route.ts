import { NextRequest, NextResponse } from "next/server";
import { isValidRegNumber } from "@/validators/auth/login";
import { handleUserSession } from "@/server/auth/handleUserSession";
import { userBlockedResponse, paramatersNotMatched } from "@/server/utils/responses";
import { useMongo } from "@/lib/database/useMongo";
import { createToken, errorResponse, isAdmin, isBlocked, decryptData } from "@/server/utils/functions";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
    const body = await req.json();
    let { username, password, wantCachedData, turnstileToken } = body;

    username = username?.toUpperCase() || "";

    if (!username || !password) {
        return paramatersNotMatched();
    }

    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || undefined;
    const turnstileResult = await verifyTurnstileToken(turnstileToken || "", ip);
    if (!turnstileResult.success) {
        return errorResponse(turnstileResult.error || "Verification failed", {}, 403);
    }

    const [isValid, errorMessage] = isValidRegNumber(username);

    if (!isValid) {
        return errorResponse(errorMessage || "Invalid Username!");
    }

    try {
        if (await isBlocked(username)) return userBlockedResponse();

        if (wantCachedData) {
            const initDb = await useMongo();
            const db = initDb.db("college_db").collection("users");
            const user = await db.findOne({ username });

            if (!user) {
                return errorResponse("No cached data found for this account.");
            }

            let canDecrypt = false;
            let cachedSessionId = "";

            if (user.session_id) {
                try {
                    const dec = decryptData(user.session_id, password);
                    if (dec) {
                        canDecrypt = true;
                        cachedSessionId = typeof dec === "string" ? dec : String(dec);
                    }
                } catch (err) {}
            }

            if (!canDecrypt && user.data) {
                try {
                    const decData = decryptData(user.data, password);
                    if (decData) {
                        canDecrypt = true;
                    }
                } catch (err) {}
            }

            if (!canDecrypt) {
                return errorResponse("Invalid credentials");
            }

            const accessToken = createToken({ username, password, admin: isAdmin(username) });
            return NextResponse.json({
                success: true,
                message: "Success (Cached)",
                accessToken,
                sessionId: cachedSessionId || "", 
                sessionTime: user.session_time || "",
                hasCachedData: true
            });
        }

        const result = await handleUserSession({ username, password });

        if (!result.success) {
            if ((result as any).hasCachedData) {
                return errorResponse(result.message, { hasCachedData: true }, 400);
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
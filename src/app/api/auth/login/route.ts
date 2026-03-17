import { useMongo } from "@/lib/database/useMongo";
import { login } from "@/backendUtils/auth/login";
import { NextRequest, NextResponse } from "next/server";
import { isValidRegNumber } from "@/validators/auth/login";
import { getTime, needsRefresh } from "@/fullStackUtils/utils/functions";
import { userBlockedResponseLogin } from "@/backendUtils/utils/responses";
import { PARAMETERS, INVALID_CREDENTIALS } from "@/fullStackUtils/utils/messages";
import { createToken, decryptData, errorResponse, isAdmin, isBlocked } from "@/backendUtils/utils/functions";

export async function POST(req: NextRequest) {
    const body = await req.json();
    let { username, password } = body;

    username = username?.toUpperCase() || "";

    if (!username || !password) {
        return errorResponse(PARAMETERS);
    }

    const [isValid, errorMessage] = isValidRegNumber(username);
    if (!isValid) {
        return errorResponse(errorMessage || "Invalid Username!");
    }

    try {
        const initDb = await useMongo();
        const time = getTime();
        const db = initDb.db('college_db').collection("users1");

        if (await isBlocked(username)) {
            return userBlockedResponseLogin();
        }

        const user = await db.findOne({ username: username });
        const accessToken = createToken({ username: username, password: password, admin: isAdmin(username) });

        let limit = user?.limit ?? (Number(process.env.LIMIT) + 1);

        if (!user) {
            const result = await login(username, password);
            if (!result || !result.success) {
                return errorResponse(INVALID_CREDENTIALS);
            } else {
                await db.updateOne(
                    { username: username },
                    {
                        $set: {
                            limit: limit,
                            session_time: time,
                        },
                        $setOnInsert: {
                            createdAt: new Date()
                        },
                    },
                    { upsert: true }
                );
                return NextResponse.json({ success: true, message: "Success!", accessToken, sessionId: result.sessionId, sessionTime: time });
            }
        }

        if (needsRefresh(user.session_time)) limit = Number(process.env.LIMIT) + 1;

        if (limit <= 0) {
            const isValid = decryptData(user.data, password);
            if (!isValid) {
                return errorResponse(INVALID_CREDENTIALS);
            }
            return NextResponse.json({ success: true, message: "Success!", accessToken, sessionTime: user.session_time });
        }

        const result = await login(username, password);

        if (!result || !result.success) {
            return errorResponse(INVALID_CREDENTIALS);
        } else {
            await db.updateOne(
                { username: username },
                {
                    $set: {
                        limit: limit,
                        session_time: time
                    },
                },
                { upsert: true }
            );
            return NextResponse.json({ success: true, message: "Success!", accessToken: accessToken, sessionId: result.sessionId, sessionTime: time });
        }
    } catch (err) {
        console.log("Error From /api/auth/login:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}
import { useMongo } from "@/lib/database/useMongo";
import { login } from "@/server/auth/login";
import { getTime, isSessionValid } from "@/shared/utils/functions";
import { encryptData, decryptData } from "@/server/utils/functions";
import { DateTime } from "luxon";

export async function handleUserSession({ username, password }: { username: string; password: string; }) {
    const initDb = await useMongo();
    const db = initDb.db("college_db").collection("users");

    const time = getTime();
    const user = await db.findOne({ username });

    // We no longer bypass hitting the portal if the session is valid,
    // because we want to guarantee we check if the portal is down during a manual login
    // so we can prompt the user for cached data on the login page itself.

    const result = await login(username, password);

    if (!result?.success) {
        if (result?.message?.includes("SRM server is unreachable") && user) {
            try {
                const sessionId = decryptData(user.session_id, password);
                if (sessionId) {
                    return {
                        success: false,
                        message: result.message,
                        hasCachedData: true,
                        cachedSessionId: sessionId,
                        cachedSessionTime: user.session_time,
                    };
                }
            } catch (err) {}
        }
        return { success: false, message: result?.message || "Invalid credentials" };
    }

    await db.updateOne(
        { username },
        {
            $set: {
                session_id: encryptData(result.sessionId, password),
                session_time: time,
            },
            $setOnInsert: {
                createdAt: DateTime.now().toJSDate(),
            },
        },
        { upsert: true }
    );

    return { success: true, sessionId: result.sessionId, sessionTime: time };
}
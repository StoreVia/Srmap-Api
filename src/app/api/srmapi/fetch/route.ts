import * as crypto from "crypto";
import { DateTime } from "luxon";
import { useMongo } from "@/lib/database/useMongo";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchFromWebsite } from "@/backendUtils/srmapi/fetchData";
import { fetchTimetable } from "@/backendUtils/srmapi/extractTimetable";
import { INVALID_CREDENTIALS } from "@/fullStackUtils/utils/messages";
import { UNAUTHORIZED } from "@/fullStackUtils/utils/messages";
import { isSessionValid } from "@/fullStackUtils/utils/functions";
import { getTime } from "@/fullStackUtils/utils/functions";
import { requireAuthResponse } from "@/backendUtils/utils/functions";
import { errorResponse } from "@/backendUtils/utils/functions";
import { decryptData } from "@/backendUtils/utils/functions";
import { encryptData } from "@/backendUtils/utils/functions";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { sessionId } = body;

    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const initDb = await useMongo();
        const db = initDb.db("college_db").collection<any>("users1");

        const time = getTime();
        const user = await db.findOne({ username: auth.payload.username });

        if (!user) {
            return errorResponse(UNAUTHORIZED, { action: "logout" });
        }

        const validSession = isSessionValid(user.session_time);

        if (validSession && sessionId) {
            const result = await fetchFromWebsite(sessionId);
            if (!result) {
                return errorResponse(INVALID_CREDENTIALS, { action: "logout" });
            }

            const encryptedData = encryptData(result, auth.payload.password);

            await db.updateOne(
                { username: auth.payload.username },
                {
                    $set: {
                        name: result.name,
                        data: encryptedData,
                        session_time: time
                    }
                }
            );

            const today = DateTime.now().setZone("Asia/Kolkata").toFormat("dd-MM-yyyy");

            const hasTodayEntry = user.attendanceHistory?.some((h: any) => h.date === today);

            if (!hasTodayEntry && result.attendance) {
                const encryptedAttendance = encryptData(result.attendance, auth.payload.password);
                await db.updateOne(
                    { username: auth.payload.username },
                    {
                        $push: {
                            attendanceHistory: {
                                $each: [
                                    {
                                        date: today,
                                        data: encryptedAttendance
                                    }
                                ],
                                $slice: -10
                            }
                        } as any
                    }
                );
            }

            (async () => {
                try {
                    const emptyClassesDb = initDb.db("college_db").collection("empty_classes");
                    const emptyClassesData = fetchTimetable(result);
                    const dataHash = crypto
                        .createHash("sha256")
                        .update(JSON.stringify(emptyClassesData))
                        .digest("hex");

                    const existingDoc = await emptyClassesDb.findOne({ hash: dataHash });
                    if (!existingDoc) {
                        await emptyClassesDb.insertOne({
                            hash: dataHash,
                            data: emptyClassesData
                        });
                    }
                } catch { }
            })();

            return NextResponse.json({ success: true, message: "Success!", data: result, source: "Srmap Portal" });
        } else if ((!validSession && user.data) || (validSession && !sessionId)) {
            try {
                const data = decryptData(user.data, auth.payload.password);
                return NextResponse.json({ success: true, message: "Success!", data, student: { name: user.name, id: user.username }, source: "Database" });
            } catch {
                return errorResponse("Invalid session data!", { action: "logout" });
            }
        } else if (validSession && !user.data && !sessionId) {
            return errorResponse("Essential Data Missing!", { action: "logout" });
        }

        return errorResponse(undefined, { action: "logout" });
    } catch (err) {
        console.log("Error From /api/srmapi/fetch:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}
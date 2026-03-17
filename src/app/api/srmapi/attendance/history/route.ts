import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { useMongo } from "@/lib/database/useMongo";
import { requireAuthResponse } from "@/backendUtils/utils/functions";
import { errorResponse } from "@/backendUtils/utils/functions";
import { decryptData } from "@/backendUtils/utils/functions";
import { UNAUTHORIZED } from "@/fullStackUtils/utils/messages";
import { DateTime } from "luxon";

export async function GET(req: NextRequest) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const initDb = await useMongo();
        const db = initDb.db("college_db").collection<any>("users1");

        const user = await db.findOne(
            { username: auth.payload.username },
            { projection: { attendanceHistory: 1 } }
        );

        if (!user) {
            return errorResponse(UNAUTHORIZED, { action: "logout" });
        }

        const today = DateTime.now().setZone("Asia/Kolkata").toFormat("dd-MM-yyyy");
        const sortedHistory = (user.attendanceHistory || [])
            .filter((h: any) => h.date !== today)
            .sort((a: any, b: any) => {
                const dateA = DateTime.fromFormat(a.date, "dd-MM-yyyy");
                const dateB = DateTime.fromFormat(b.date, "dd-MM-yyyy");
                return dateB.toMillis() - dateA.toMillis();
            });

        return NextResponse.json({
            success: true,
            history: sortedHistory.map((h: any) => ({
                date: h.date,
                encrypted: true
            }))
        });
    } catch (err) {
        console.log("Error From /srmapi/attendance/history GET:", err);
        return errorResponse(undefined, {}, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { date, password } = body;

        const auth = await requireAuthResponse(req);
        if (auth instanceof NextResponse) return auth;

        const initDb = await useMongo();
        const db = initDb.db("college_db").collection<any>("users1");

        const user = await db.findOne(
            { username: auth.payload.username },
            { projection: { attendanceHistory: 1 } }
        );

        if (!user) {
            return errorResponse(UNAUTHORIZED, { action: "logout" });
        }

        const entry = user.attendanceHistory?.find(
            (h: any) => h.date === date
        );

        if (!entry) {
            return errorResponse("Attendance data not found for this date", { action: "none" }, 404);
        }

        try {
            const decryptionPassword = password || auth.payload.password;
            const decryptedData = decryptData(entry.data, decryptionPassword);

            const parsedData =
                typeof decryptedData === "string"
                    ? JSON.parse(
                        decryptedData.trim().startsWith("[")
                            ? decryptedData
                            : `[${decryptedData}]`
                    )
                    : decryptedData;

            return NextResponse.json({ success: true, data: parsedData, date: entry.date });
        } catch (decryptError) {
            if (!password) {
                return NextResponse.json({
                    success: false,
                    code: "PASSWORD_REQUIRED",
                    message: "Please enter your password to view this attendance data"
                }, { status: 401 });
            }
            return NextResponse.json({ success: false, code: "INVALID_PASSWORD", message: "Incorrect password. Please try again." }, { status: 401 });
        }
    } catch (err) {
        console.log("Error From /srmapi/attendance/history POST:", err);
        return errorResponse(undefined, {}, 500);
    }
}
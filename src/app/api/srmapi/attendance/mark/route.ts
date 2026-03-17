import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { UNAUTHORIZED } from "@/fullStackUtils/utils/messages";
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions";

export async function POST(req: NextRequest) {
    const body = await req.json();
    let { sessionid, code } = body;

    if (!sessionid || !code) {
        return errorResponse("Required Parameters Not Matched!");
    }

    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const initDb = await useMongo();
        const db = initDb.db('college_db').collection("users1");

        const user = await db.findOne({ username: auth.payload.username });
        if (!user) {
            return errorResponse(UNAUTHORIZED);
        }

        const SUBMIT_URL = "https://student.srmap.edu.in/srmapstudentcorner/students/transaction/studentattendanceresources.jsp";
        const payload = new URLSearchParams({
            acode: code,
            dynamiclatdata: "0",
            dynamiclonxdata: "0",
            ids: "1"
        });

        const response = await fetch(SUBMIT_URL, {
            method: "POST",
            body: payload,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0",
                "Cookie": `JSESSIONID=${sessionid}`,
            }
        });

        const text = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(text.trim());
        } catch {
            const jsonString = text.replace(/<[^>]+>/g, "").trim();
            responseData = JSON.parse(jsonString);
        }

        if (responseData.resultstatus === "1") {
            return NextResponse.json({ success: true, message: "Attendance Captured Successfully!" });
        } else if (typeof responseData.result === "string" &&responseData.result.includes("Your Attendance captured al")) {
            return NextResponse.json({ success: true, message: "Attendance Captured Already!" });
        } else if (typeof responseData.result === "string" &&responseData.result.includes("You have entered the Wrong Attendance")){
            return errorResponse("Wrong Attendance Code!", {}, 404);
        } else {
            return errorResponse("Incorrect Attendance Code!", {}, 404);
        }
    } catch (err) {
        console.error("Error From /api/srmapi/attendance/mark:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}
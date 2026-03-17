import * as cheerio from "cheerio";
import { getFullDateAndTime } from "@/fullStackUtils/utils/functions";

export interface AttendanceItem {
    date: string;
    day: string;
    hour: string;
    subject: string;
    status: string;
}

export interface AttendanceResult {
    attendance: AttendanceItem[];
    last_fetched: string;
}

export async function fetchAttendance(sessionId: string): Promise<AttendanceResult | null> {
    const response = await fetch(
        "https://student.srmap.edu.in/srmapstudentcorner/students/transaction/studentattendance.jsp",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0",
                "Cookie": `JSESSIONID=${sessionId}`
            },
            body: new URLSearchParams({ ids: "33" })
        }
    );

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);
    const attendance: AttendanceItem[] = [];

    $("div.container-fluid").each((_, container) => {
        const title = $(container).find("div.row div").first().text().trim();
        if (title !== "Today Attendance") return;

        $(container)
            .find("div.row")
            .slice(2)
            .each((_, row) => {
                const cols = $(row)
                    .find("div")
                    .map((_, col) => $(col).text().trim())
                    .get();

                if (cols.length !== 5) return;

                attendance.push({
                    date: cols[0],
                    day: cols[1],
                    hour: cols[2],
                    subject: cols[3],
                    status: cols[4]
                });
            });
    });

    return {
        attendance,
        last_fetched: getFullDateAndTime()
    };
}
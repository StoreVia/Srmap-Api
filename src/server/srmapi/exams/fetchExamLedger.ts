import * as cheerio from "cheerio";
import { createClient } from "@/server/utils/functions";
import { getFullDateAndTime } from "@/shared/utils/functions";

interface ExamLedgerRow {
  semester: string;
  month_year: string;
  subject_code: string;
  subject_description: string;
  credit: string;
  grade: string;
  grade_points: string;
  result: string;
  attempt: string;
}

interface ExamLedgerData {
  last_fetched: string;
  cgpa: string;
  rows: ExamLedgerRow[];
}

async function fetchExamLedger(sessionId: string): Promise<ExamLedgerData | null> {
  const session = createClient(sessionId);

  try {
    const res = await session.post(
      "https://student.srmap.edu.in/srmapstudentcorner/students/report/studentreportresources.jsp",
      new URLSearchParams({ ids: "6" }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const $ = cheerio.load(res.data as string);
    const rows: ExamLedgerRow[] = [];

    $("div.subTable table tr").each((_, row) => {
      const td = $(row).find("td");
      if (td.length < 9) return;

      rows.push({
        semester: td.eq(0).text().trim(),
        month_year: td.eq(1).text().trim(),
        subject_code: td.eq(2).text().trim(),
        subject_description: td.eq(3).text().trim(),
        credit: td.eq(4).text().trim(),
        grade: td.eq(5).text().trim(),
        grade_points: td.eq(6).text().trim(),
        result: td.eq(7).text().trim(),
        attempt: td.eq(8).text().trim(),
      });
    });

    let cgpa = "";
    $("div").each((_, div) => {
      const text = $(div).text().replace(/\s+/g, " ").trim();
      if (!/CGPA\s*:/i.test(text)) return;
      const match = text.match(/CGPA\s*:\s*([0-9.]+)/i);
      if (match?.[1]) {
        cgpa = match[1];
      }
    });

    return {
      last_fetched: getFullDateAndTime(),
      cgpa,
      rows,
    };
  } catch (err) {
    console.error("Exam Ledger Fetch Error:", (err as Error).message);
    return null;
  }
}

export { fetchExamLedger };

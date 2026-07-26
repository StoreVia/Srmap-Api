import * as cheerio from "cheerio";
import { createClient } from "@/server/utils/functions";
import { getFullDateAndTime } from "@/shared/utils/functions";

interface PastInternalSemester {
  semester: number;
  label: string;
}

interface PastInternalMarkRow {
  semester: string;
  code: string;
  description: string;
  subject_type: string;
  mark_obtained: string;
  max_mark: string;
}

interface PastInternalsData {
  last_fetched: string;
  semesters: PastInternalSemester[];
  rows: PastInternalMarkRow[];
  selected_semester: number | null;
}

function extractSemesterFromOnclick(onclickValue: string): number | null {
  const match = onclickValue.match(/funEarlierInternalMarks\((\d+)\)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isNaN(parsed) ? null : parsed;
}

async function fetchPastInternals(sessionId: string, filterSemester?: number): Promise<PastInternalsData | null> {
  const session = createClient(sessionId);

  try {
    const semesterRes = await session.post(
      "https://student.srmap.edu.in/srmapstudentcorner/students/report/studentreportresources.jsp",
      new URLSearchParams({ ids: "22" }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const $semesters = cheerio.load(semesterRes.data as string);
    const semesters: PastInternalSemester[] = [];

    $semesters("button").each((_, btn) => {
      const element = $semesters(btn);
      const onclickValue = element.attr("onclick") ?? "";
      if (!onclickValue.includes("funEarlierInternalMarks")) return;

      const semesterNumber = extractSemesterFromOnclick(onclickValue);
      if (!semesterNumber) return;

      semesters.push({
        semester: semesterNumber,
        label: element.text().trim() || `Semester ${semesterNumber}`,
      });
    });

    if (!filterSemester) {
      return {
        last_fetched: getFullDateAndTime(),
        semesters,
        rows: [],
        selected_semester: null,
      };
    }

    const detailRes = await session.post(
      "https://student.srmap.edu.in/srmapstudentcorner/students/report/studentreportresources.jsp",
      new URLSearchParams({ ids: "23", filter: String(filterSemester) }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const $details = cheerio.load(detailRes.data as string);
    const rows: PastInternalMarkRow[] = [];

    $details("table.table.table-striped.table-bordered > tbody > tr").each((_, row) => {
      const td = $details(row).find("td");
      if (td.length !== 6) return;

      rows.push({
        semester: td.eq(0).text().trim(),
        code: td.eq(1).text().trim(),
        description: td.eq(2).text().trim(),
        subject_type: td.eq(3).text().trim(),
        mark_obtained: td.eq(4).text().trim(),
        max_mark: td.eq(5).text().trim(),
      });
    });

    return {
      last_fetched: getFullDateAndTime(),
      semesters,
      rows,
      selected_semester: filterSemester,
    };
  } catch (err) {
    console.error("Past Internals Fetch Error:", (err as Error).message);
    return null;
  }
}

export { fetchPastInternals };

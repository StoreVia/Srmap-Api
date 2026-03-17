import * as cheerio from "cheerio";
import { createClient } from "@/backendUtils/utils/functions";
import { getFullDateAndTime } from "@/fullStackUtils/utils/functions";

interface InternalExamDetail {
  name: string;
  conducted_obtained?: string;
  conducted_max?: string;
  converted_obtained?: string;
  converted_max?: string;
}

interface InternalSubject {
  subject_code: string;
  subject_name: string;
  marks_obtained: string;
  max_marks: string;
  exams: InternalExamDetail[];
}

interface InternalData {
  last_fetched: string;
  subjects: InternalSubject[];
}

function splitPair(raw: string): { left: string; right: string } {
  if (!raw) return { left: "", right: "" };
  const parts = raw.split("/");
  if (parts.length === 1) {
    return { left: parts[0].trim(), right: "" };
  }
  return { left: parts[0].trim(), right: parts[1].trim() };
}

async function fetchInternalMarks(sessionId: string): Promise<InternalData | null> {
  const session = createClient(sessionId);

  try {
    const res = await session.post(
      "https://student.srmap.edu.in/srmapstudentcorner/students/report/studentreportresources.jsp",
      new URLSearchParams({ ids: "5" }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const $ = cheerio.load(res.data as string);
    const subjects: InternalSubject[] = [];
    $("table.table.table-striped.table-bordered > tbody > tr").each((i, row) => {
      const td = $(row).find("td");
      if (td.length === 4) {
        const subject_code = td.eq(0).text().trim();
        const subject_name = td.eq(1).text().trim();
        const marks_obtained = td.eq(2).text().trim();
        const max_marks = td.eq(3).text().trim();

        const detailRow = $(row).next("tr");
        const exams: InternalExamDetail[] = [];

        detailRow.find("table tr").each((j, drow) => {
          const dtd = $(drow).find("td");
          if (dtd.length === 3 && !dtd.eq(0).hasClass("ui-state-active")) {
            const name = dtd.eq(0).text().trim();
            const rawConducted = dtd.eq(1).text().trim();
            const rawConverted = dtd.eq(2).text().trim();

            const conducted = splitPair(rawConducted);
            const converted = splitPair(rawConverted);

            exams.push({
              name,
              conducted_obtained: conducted.left || "",
              conducted_max: conducted.right || "",
              converted_obtained: converted.left || "",
              converted_max: converted.right || ""
            });
          }
        });

        subjects.push({
          subject_code,
          subject_name,
          marks_obtained,
          max_marks,
          exams,
        });
      }
    });

    return {
      last_fetched: getFullDateAndTime(),
      subjects,
    };
  } catch (err) {
    console.error("Internal Marks Fetch Error:", (err as Error).message);
    return null;
  }
}

export { fetchInternalMarks };
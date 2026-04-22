
import * as cheerio from "cheerio";
import { createClient } from "@/backendUtils/utils/functions";
import { getFacultyCabin } from "@/backendUtils/faculty/faculty";

interface SubjectMap {
  [key: string]: {
    semester: string;
    credit: string;
  };
}

interface AttendanceRecord {
  subject_code: string;
  subject_name: string;
  classes_conducted: string;
  present: string;
  absent: string;
  present_percentage: string;
  od_ml_taken: string;
  od_ml_percentage: string;
  attendance_percentage: string;
}

export interface TimetableDay {
  day: string;
  subjects: string[];
}

interface SubjectDetail {
  code: string;
  name: string;
  ltp: string;
  credit: string;
  semester: string;
  faculty: string;
  classrooms: string;
  facultyCabins?: {
    name: string;
    location: string;
  }[];
}

interface ProfileData {
  studentName?: string;
  registerNo?: string;
  institution?: string;
  semester?: string;
  program?: string;
  section?: string;
  specialization?: string;
  dob?: string;
  gender?: string;
  picture?: string;
}

interface CGPAData {
  cgpa: string;
}

export interface WebsiteData {
  attendance: AttendanceRecord[];
  timetable: TimetableDay[];
  subjects: SubjectDetail[];
  profile: ProfileData;
  cgpa: CGPAData;
  name?: string;
  id?: string;
}

async function fetchFromWebsite(sessionId: string): Promise<WebsiteData | null> {
  const client = createClient(sessionId);

  try {
    const postPage = (id: string) =>
      client.post(
        "https://student.srmap.edu.in/srmapstudentcorner/students/report/studentreportresources.jsp",
        new URLSearchParams({ ids: id }).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

    const [resOriginal, resAttendance, resTimetable, resSubjects, resProfile, resCgpa] =
      await Promise.all([
        client.post("https://student.srmap.edu.in/srmapstudentcorner/HRDSystem"),
        postPage("3"),
        postPage("10"),
        postPage("2"),
        postPage("1"),
        postPage("6")
      ]);

    const $original = cheerio.load(resOriginal.data);
    const $attendance = cheerio.load(resAttendance.data);
    const $timetable = cheerio.load(resTimetable.data);
    const $subjects = cheerio.load(resSubjects.data);
    const $profile = cheerio.load(resProfile.data);
    const $cgpa = cheerio.load(resCgpa.data);

    const attendance: AttendanceRecord[] = [];
    const timetable: TimetableDay[] = [];
    const subjectDetails: SubjectDetail[] = [];
    const profile: ProfileData = {};

    const cgpaDiv = $cgpa("div[style*='float: right'][style*='font-size']");
    const cgpa: CGPAData = {
      cgpa: cgpaDiv.length ? cgpaDiv.text().split(":")[1]?.trim() || "0" : "0"
    };

    const subjectMap: SubjectMap = {};
    $subjects("table.table-striped tr").each((_, row) => {
      const td = $subjects(row).find("td");
      if (td.length === 5) {
        subjectMap[td.eq(1).text().trim()] = {
          semester: td.eq(0).text().trim(),
          credit: td.eq(3).text().trim()
        };
      }
    });

    $attendance("table#tblSubjectWiseAttendance tr").each((_, row) => {
      const td = $attendance(row).find("td");
      if (td.length === 9) {
        attendance.push({
          subject_code: td.eq(0).text().trim(),
          subject_name: td.eq(1).text().trim(),
          classes_conducted: td.eq(2).text().trim(),
          present: td.eq(3).text().trim(),
          absent: td.eq(4).text().trim(),
          od_ml_taken: td.eq(5).text().trim(),
          present_percentage: td.eq(6).text().trim(),
          od_ml_percentage: td.eq(7).text().trim(),
          attendance_percentage: td.eq(8).text().trim()
        });
      }
    });

    const rawTimetable: TimetableDay[] = [];
    $timetable("tr").slice(2).each((_, row) => {
      const td = $timetable(row).find("td");
      if (td.length > 1) {
        rawTimetable.push({
          day: td.eq(0).text().trim(),
          subjects: td
            .slice(1)
            .map((_, el) => $timetable(el).text().trim())
            .get()
        });
      }
    });

    timetable.push(...rawTimetable.slice(0, 5));

    rawTimetable.slice(7).forEach(item => {
      if (item.subjects.length >= 4) {
        const code = item.day;
        const faculty = item.subjects[2].trim();

        const cabins = faculty
          .split(",")
          .map(name => {
            const cabin = getFacultyCabin(name);
            if (!cabin) return null;
            return { name: name.trim(), location: cabin.location };
          })
          .filter(Boolean) as SubjectDetail["facultyCabins"];

        subjectDetails.push({
          code,
          name: item.subjects[0],
          ltp: item.subjects[1],
          credit: subjectMap[code]?.credit || "",
          semester: subjectMap[code]?.semester || "",
          faculty,
          classrooms: item.subjects[3],
          facultyCabins: cabins?.length ? cabins : undefined
        });
      }
    });

    $profile("table.table-striped tr").each((_, row) => {
      const td = $profile(row).find("td");
      if (td.length === 3) {
        const key = td.eq(0).text().trim();
        const val = td.eq(2).text().trim();

        if (/Student Name/i.test(key)) profile.studentName = val;
        else if (/Register No/i.test(key)) profile.registerNo = val;
        else if (/Institution/i.test(key)) profile.institution = val;
        else if (/Semester/i.test(key)) profile.semester = val;
        else if (/Program \/ Section/i.test(key)) {
          const [program, section] = val.split("/").map(v => v.trim());
          profile.program = program;
          profile.section = section?.replace(/['"]+/g, "");
        } else if (/Specialization/i.test(key)) profile.specialization = val;
        else if (/D\.O\.B\. \/ Gender/i.test(key)) {
          const [dob, gender] = val.split("/").map(v => v.trim());
          profile.dob = dob;
          profile.gender = gender;
        }
      }
    });

    const pic = $original("div.profile_pic img").attr("src");
    if (pic) profile.picture = `https://student.srmap.edu.in${pic}`;

    return {
      name: profile.studentName ?? "",
      id: profile.registerNo ?? "",
      attendance,
      timetable,
      subjects: subjectDetails,
      profile,
      cgpa
    };
  } catch {
    return null;
  }
}

export { fetchFromWebsite };

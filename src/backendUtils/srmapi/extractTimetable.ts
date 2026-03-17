import type { TimetableDay, WebsiteData } from "@/backendUtils/srmapi/fetchData";

interface TimetableAndProfile {
  timetable: TimetableDay[];
  profile: {
    institution?: string;
    semester?: string;
    program?: string;
    section?: string;
  };
};

export function fetchTimetable(data: WebsiteData): TimetableAndProfile {
  return {
    timetable: data.timetable,
    profile: {
      institution: data.profile.institution,
      semester: data.profile.semester,
      program: data.profile.program,
      section: data.profile.section,
    }
  };
};
import type { TimetableDay, WebsiteData } from "@/server/srmapi/fetchData";

export interface SubjectDetail {
  code: string;
  name: string;
  ltp?: string;
  credit?: string;
  semester?: string;
  faculty?: string;
  classrooms?: string;
  facultyCabins?: {
    name: string;
    location: string;
  }[];
}

export interface TimetableAndProfile {
  timetable: TimetableDay[];
  subjects: SubjectDetail[];
  profile: {
    institution?: string;
    semester?: string;
    program?: string;
    section?: string;
    specialization?: string;
  };
}

export function fetchTimetable(data: WebsiteData): TimetableAndProfile {
  return {
    timetable: data.timetable,
    subjects: data.subjects || [],
    profile: {
      institution: data.profile.institution,
      semester: data.profile.semester,
      program: data.profile.program,
      section: data.profile.section,
      specialization: data.profile.specialization,
    }
  };
}
export interface Profile {
  studentName?: string;
  registerNo?: string;
  institution?: string;
  semester?: string;
  program?: string;
  section?: string;
  dob?: string;
  gender?: string;
  picture?: string;
}

export interface CGPA {
  cgpa: string;
}

export interface Subject {
  name: string;
  code: string;
  classrooms?: string;
  credit?: string;
  faculty?: string;
  ltp?: string;
  semester?: string;
  facultyCabins?: {
    name: string;
    location: string;
  }[];
}

export interface Attendance {
  classes_conducted: number | string;
  present: number | string;
  subject_code: string;
  subject_name: string;
  attendance_percentage: string;
  absent?: string;
  od_ml_percentage?: string;
  od_ml_taken?: string;
  present_percentage?: string;
}

export interface TimetableEntry {
  day: string;
  subjects: string[];
}

export interface StudentDataContextType {
  profile: Profile | null;
  cgpa: CGPA | null;
  subjects: Subject[];
  attendance: Attendance[];
  timetable: TimetableEntry[];
  loading: boolean;
  initialized: boolean;
  error: any;
  fetchFreshData: (override?: { sessionId?: string; sessionTime?: string }) => Promise<void>;
}
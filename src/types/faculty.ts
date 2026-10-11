export interface FacultyEducationItem {
  year: string;
  degree: string;
  details: string[];
}

export interface FacultyDetails {
  education?: FacultyEducationItem[];
  experience?: string[];
  researchInterests?: string[];
  awards?: string[];
  publications?: string[];
  patents?: string[];
  projects?: string[];
  doctoralScholars?: string[];
  interests?: string[];
  thoughtLeadership?: string[];
  memberships?: string[];
  personalWebsite?: string;
}

export interface FacultyRatingSummary {
  teachingAvg: number;
  examsAvg: number;
  correctionAvg: number;
  marksAvg: number;
  overallAvg: number;
  totalRatings: number;
}

export interface FacultyItem {
  _id?: string;
  name: string;
  slug: string;
  designation: string;
  departments: string[];
  degree: string;
  email: string;
  phone?: string;
  imageUrl: string;
  profileUrl: string;
  officeLocation?: string;
  socialLinks?: { title: string; url: string }[];
  details?: FacultyDetails;
  ratingSummary?: FacultyRatingSummary;
  updatedAt?: string | Date;
}

export interface StaffItem {
  _id?: string;
  name: string;
  designation: string;
  departments: string[];
  phone?: string;
  email?: string;
  imageUrl: string;
  updatedAt?: string | Date;
}

export interface FacultyRatingRecord {
  _id?: string;
  facultyId: string;
  username: string;
  teaching: number;
  exams: number;
  correction: number;
  marks: number;
  overall: number;
  createdAt: Date | string;
}

export interface ScrapeProgressState {
  inProgress: boolean;
  stage: "idle" | "faculty_list" | "faculty_details" | "staff_list" | "saving" | "completed" | "error";
  total: number;
  completed: number;
  left: number;
  currentTarget: string;
  error?: string | null;
  lastScrapedAt?: string | null;
  startedAt?: string | null;
  totalFaculty?: number;
  totalStaff?: number;
}

export interface FacultyTimetableSlotEntry {
  code: string;
  name: string;
  venue: string;
  section: string;
  program?: string;
  semester?: string;
}

export interface FacultyTimetableRecord {
  _id?: string;
  facultyId?: string;
  facultyName: string;
  facultySlug: string;
  designation?: string;
  departments?: string[];
  email?: string;
  imageUrl?: string;
  cabin?: string;
  totalClasses: number;
  schedule: Record<string, Record<string, FacultyTimetableSlotEntry[]>>;
  updatedAt: string | Date;
}

export interface FacultyTimetableProgressState {
  inProgress: boolean;
  stage: "idle" | "loading_students" | "matching" | "saving" | "completed" | "error";
  total: number;
  completed: number;
  currentTarget: string;
  error?: string | null;
  lastGeneratedAt?: string | null;
  count?: number;
  totalClasses?: number;
}

export interface FacultyTimetableMeta {
  lastGeneratedAt?: string | Date | null;
  totalFacultyWithSchedules: number;
  totalClasses: number;
  totalTimetablesProcessed: number;
  inProgress?: boolean;
  progress?: FacultyTimetableProgressState;
}


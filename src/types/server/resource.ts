import { ObjectId } from "mongodb";

export interface YearDocument {
  _id?: ObjectId | string;
  year: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseDocument {
  _id?: ObjectId | string;
  year: string;
  code: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectDocument {
  _id?: ObjectId | string;
  courseCode: string;
  year: string;
  code: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceDocument {
  _id?: ObjectId | string;
  courseCode: string;
  year: string;
  subjectId: string;
  category: "previousYearPapers" | "slidesAndNotes";
  examType?: "mid" | "sem";
  title: string;
  size: string;
  fileType: string;
  downloadUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientCourse {
  name: string;
  code: string;
}

export interface ClientSubject {
  id: string;
  code: string;
  name: string;
}

export interface ClientResourceItem {
  id: string;
  title: string;
  size: string;
  type: string;
  downloadUrl: string;
}

export interface ClientSubjectResources {
  previousYearPapers?: {
    mid?: ClientResourceItem[];
    sem?: ClientResourceItem[];
  };
  slidesAndNotes?: ClientResourceItem[];
}
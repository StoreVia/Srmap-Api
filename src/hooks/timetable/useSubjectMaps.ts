import { useMemo } from "react";

interface RawAttendance {
  subject_code: string;
  subject_name?: string;
  present?: number | string;
  classes_conducted?: number | string;
  od_ml_taken?: number | string;
  od_ml_percentage?: number | string;
  present_percentage?: number | string;
  attendance_percentage?: number | string;
  absent?: number | string;
}

interface RawSubject {
  code: string;
  name: string;
}

export interface AttendanceShape {
  subject_code: string;
  subject_name: string;
  attended: number;
  conducted: number;
  od_ml_taken: number;
  od_ml_percentage: number;
  present_percentage: number;
  percentage: number;
  absent: number;
}

export function useSubjectMaps(
  subjects: RawSubject[],
  attendance: RawAttendance[]
) {
  const subjectCodeToName = useMemo(() => {
    const map: Record<string, string> = {};
    subjects.forEach((s) => {
      map[s.code] = s.name;
    });
    return map;
  }, [subjects]);

  const subjectCodeToAttendance = useMemo(() => {
    const map: Record<string, AttendanceShape> = {};
    attendance.forEach((att) => {
      map[att.subject_code] = {
        subject_code: att.subject_code ?? "",
        subject_name: att.subject_name ?? "",
        attended: Number(att.present) || 0,
        conducted: Number(att.classes_conducted) || 0,
        od_ml_taken: Number(att.od_ml_taken) || 0,
        od_ml_percentage: Number(att.od_ml_percentage) || 0,
        present_percentage: Number(att.present_percentage) || 0,
        percentage: Number(att.attendance_percentage) || 0,
        absent: Number(att.absent) || 0,
      };
    });
    return map;
  }, [attendance]);

  return { subjectCodeToName, subjectCodeToAttendance };
}
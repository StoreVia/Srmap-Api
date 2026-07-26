import type { AttendanceShape } from "@/hooks/timetable/useSubjectMaps";

export function mapToAttendanceShape(raw: Record<string, any>): AttendanceShape {
  return {
    subject_code: raw.subject_code ?? "",
    subject_name: raw.subject_name ?? "",
    attended: Number(raw.present) || 0,
    conducted: Number(raw.classes_conducted) || 0,
    od_ml_taken: Number(raw.od_ml_taken) || 0,
    od_ml_percentage: Number(raw.od_ml_percentage) || 0,
    present_percentage: Number(raw.present_percentage) || 0,
    percentage: Number(raw.attendance_percentage) || 0,
    absent: Number(raw.absent) || 0,
  };
}

export function mapManyToAttendanceShape(rows: Record<string, any>[]): AttendanceShape[] {
  return rows.map(mapToAttendanceShape);
}
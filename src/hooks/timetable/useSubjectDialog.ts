import { useState } from "react";
import type { AttendanceShape } from "@/hooks/timetable/useSubjectMaps";

type SelectedSubject = {
  code: string;
  name: string;
  venue: string;
  day: string;
  timeSlot: string;
};

export const useSubjectDialog = (
  subjectCodeToName: Record<string, string>,
  subjectCodeToAttendance: Record<string, AttendanceShape>
) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SelectedSubject | null>(null);
  const [selectedSubjectAttendance, setSelectedSubjectAttendance] = useState<AttendanceShape | null>(null);

  const handleSubjectClick = (
    code: string,
    venue: string,
    day: string,
    timeSlot: string
  ) => {
    const resolvedCode = code || "N/A";
    setSelectedSubject({
      code: resolvedCode,
      name: code ? (subjectCodeToName[code] || code) : "Free Period",
      venue: code ? venue : "No Venue",
      day,
      timeSlot,
    });
    setSelectedSubjectAttendance(code ? (subjectCodeToAttendance[code] ?? null) : null);
    setDialogOpen(true);
  };

  return {
    dialogOpen,
    setDialogOpen,
    selectedSubject,
    selectedSubjectAttendance,
    handleSubjectClick,
  };
};
import { useState, useMemo, useCallback } from "react";
import type { TimetableEntry } from "@/types/context/studentContext";
import type { AttendanceShape } from "@/hooks/timetable/useSubjectMaps";
import type {
  SelectedSimulationDate,
  SimulationDayStatus,
  SimulationSummary,
} from "@/types/simulation";
import {
  calculateAbsenceSimulation,
  getDayNameFromDate,
  getClassesForDay,
} from "@/shared/utils/attendanceSimulation";

export function useAbsentSimulation(
  timetable: TimetableEntry[],
  attendance: AttendanceShape[],
  subjectCodeToName: Record<string, string>
) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateStatusMap, setDateStatusMap] = useState<Record<string, SimulationDayStatus>>({});

  const selectedDatesList: SelectedSimulationDate[] = useMemo(() => {
    return Object.entries(dateStatusMap).map(([date, status]) => {
      const dayName = getDayNameFromDate(date);
      const classes = getClassesForDay(timetable, dayName, subjectCodeToName);
      return {
        date,
        dayName,
        status,
        selectedSlots: classes.map((c) => c.slotIndex),
      };
    });
  }, [dateStatusMap, timetable, subjectCodeToName]);

  const selectedDateStrings = useMemo(() => {
    return Object.keys(dateStatusMap).sort();
  }, [dateStatusMap]);

  const toggleDate = useCallback((dateStr: string) => {
    if (!dateStr) return;
    setDateStatusMap((prev) => {
      const copy = { ...prev };
      if (!copy[dateStr]) {
        copy[dateStr] = "absent";
      } else if (copy[dateStr] === "absent") {
        copy[dateStr] = "present";
      } else {
        delete copy[dateStr];
      }
      return copy;
    });
  }, []);

  const setDateStatus = useCallback((dateStr: string, status: SimulationDayStatus) => {
    if (!dateStr) return;
    setDateStatusMap((prev) => ({
      ...prev,
      [dateStr]: status,
    }));
  }, []);

  const removeDate = useCallback((dateStr: string) => {
    setDateStatusMap((prev) => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });
  }, []);

  const clearAll = useCallback(() => {
    setDateStatusMap({});
  }, []);

  const simulationSummary: SimulationSummary = useMemo(() => {
    return calculateAbsenceSimulation(
      attendance,
      timetable,
      subjectCodeToName,
      selectedDatesList
    );
  }, [attendance, timetable, subjectCodeToName, selectedDatesList]);

  const isSimulationActive =
    simulationSummary.totalMissedClasses > 0 ||
    simulationSummary.totalAttendedClasses > 0;

  return {
    calendarOpen,
    setCalendarOpen,
    dateStatusMap,
    selectedDatesList,
    selectedDateStrings,
    toggleDate,
    setDateStatus,
    removeDate,
    clearAll,
    simulationSummary,
    isSimulationActive,
  };
}
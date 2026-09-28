import { useState, useMemo, useCallback } from "react";
import type { TimetableEntry } from "@/types/context/studentContext";
import type { AttendanceShape } from "@/hooks/timetable/useSubjectMaps";
import type { SelectedAbsenceDate, SimulationSummary } from "@/types/simulation";
import {
  calculateAbsenceSimulation,
  getDayNameFromDate,
  getClassesForDay,
  getIsoDateString,
} from "@/shared/utils/attendanceSimulation";

export function useAbsentSimulation(
  timetable: TimetableEntry[],
  attendance: AttendanceShape[],
  subjectCodeToName: Record<string, string>
) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateSlotMap, setDateSlotMap] = useState<Record<string, number[]>>({});

  const selectedDatesList: SelectedAbsenceDate[] = useMemo(() => {
    return Object.entries(dateSlotMap).map(([date, slots]) => {
      const dayName = getDayNameFromDate(date);
      return {
        date,
        dayName,
        selectedSlots: slots,
      };
    });
  }, [dateSlotMap]);

  const selectedDateStrings = useMemo(() => {
    return Object.keys(dateSlotMap);
  }, [dateSlotMap]);

  const setDates = useCallback(
    (dates: string[]) => {
      const newMap: Record<string, number[]> = {};
      dates.forEach((dateStr) => {
        const dayName = getDayNameFromDate(dateStr);
        const classes = getClassesForDay(timetable, dayName, subjectCodeToName);
        const existingSlots = dateSlotMap[dateStr];
        newMap[dateStr] = existingSlots !== undefined ? existingSlots : classes.map((c) => c.slotIndex);
      });
      setDateSlotMap(newMap);
    },
    [timetable, subjectCodeToName, dateSlotMap]
  );

  const addDate = useCallback(
    (dateStr: string) => {
      if (!dateStr) return;
      const dayName = getDayNameFromDate(dateStr);
      const classes = getClassesForDay(timetable, dayName, subjectCodeToName);
      const allSlots = classes.map((c) => c.slotIndex);

      setDateSlotMap((prev) => ({
        ...prev,
        [dateStr]: allSlots,
      }));
    },
    [timetable, subjectCodeToName]
  );

  const removeDate = useCallback((dateStr: string) => {
    setDateSlotMap((prev) => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });
  }, []);

  const toggleSlot = useCallback(
    (dateStr: string, slotIndex: number) => {
      setDateSlotMap((prev) => {
        const currentSlots = prev[dateStr] || [];
        const exists = currentSlots.includes(slotIndex);
        const updated = exists
          ? currentSlots.filter((idx) => idx !== slotIndex)
          : [...currentSlots, slotIndex];

        return {
          ...prev,
          [dateStr]: updated,
        };
      });
    },
    []
  );

  const toggleAllSlotsForDate = useCallback(
    (dateStr: string) => {
      const dayName = getDayNameFromDate(dateStr);
      const classes = getClassesForDay(timetable, dayName, subjectCodeToName);
      const allSlots = classes.map((c) => c.slotIndex);

      setDateSlotMap((prev) => {
        const currentSlots = prev[dateStr] || [];
        const isAllSelected = currentSlots.length === allSlots.length;

        return {
          ...prev,
          [dateStr]: isAllSelected ? [] : allSlots,
        };
      });
    },
    [timetable, subjectCodeToName]
  );

  const selectToday = useCallback(() => {
    const todayStr = getIsoDateString(new Date());
    addDate(todayStr);
  }, [addDate]);

  const selectTomorrow = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getIsoDateString(tomorrow);
    addDate(tomorrowStr);
  }, [addDate]);

  const clearAll = useCallback(() => {
    setDateSlotMap({});
  }, []);

  const simulationSummary: SimulationSummary = useMemo(() => {
    return calculateAbsenceSimulation(
      attendance,
      timetable,
      subjectCodeToName,
      selectedDatesList
    );
  }, [attendance, timetable, subjectCodeToName, selectedDatesList]);

  const isSimulationActive = simulationSummary.totalMissedClasses > 0;

  const isClassSimulatedAbsent = useCallback(
    (dayName: string, slotIndex: number) => {
      return selectedDatesList.some(
        (item) =>
          item.dayName.toLowerCase() === dayName.toLowerCase() &&
          item.selectedSlots.includes(slotIndex)
      );
    },
    [selectedDatesList]
  );

  const isDateSelected = useCallback(
    (dateStr: string) => {
      return Boolean(dateSlotMap[dateStr]);
    },
    [dateSlotMap]
  );

  return {
    calendarOpen,
    setCalendarOpen,
    dateSlotMap,
    selectedDatesList,
    selectedDateStrings,
    setDates,
    addDate,
    removeDate,
    toggleSlot,
    toggleAllSlotsForDate,
    selectToday,
    selectTomorrow,
    clearAll,
    simulationSummary,
    isSimulationActive,
    isClassSimulatedAbsent,
    isDateSelected,
  };
}
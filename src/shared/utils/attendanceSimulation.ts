import type { TimetableEntry } from "@/types/context/studentContext";
import type { AttendanceShape } from "@/hooks/timetable/useSubjectMaps";
import { ALL_DAYS, parseSubject, TIME_SLOTS } from "@/shared/utils/timetable";
import type {
  DayClassSlot,
  SubjectSimulationResult,
  SimulationSummary,
  SelectedAbsenceDate,
} from "@/types/simulation";

export type {
  DayClassSlot,
  SubjectSimulationResult,
  SimulationSummary,
  SelectedAbsenceDate,
};

export function getDayNameFromDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return "";
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  return ALL_DAYS[dateObj.getDay()] || "";
}

export function formatReadableDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return dateStr;
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getIsoDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getClassesForDay(
  timetable: TimetableEntry[],
  dayName: string,
  subjectCodeToName: Record<string, string> = {}
): DayClassSlot[] {
  if (!timetable || !dayName) return [];
  const dayData = timetable.find(
    (t) => t.day.trim().toLowerCase() === dayName.trim().toLowerCase()
  );
  if (!dayData?.subjects) return [];

  const slots: DayClassSlot[] = [];
  dayData.subjects.forEach((subjStr, slotIndex) => {
    const { code, venue } = parseSubject(subjStr);
    if (code) {
      slots.push({
        slotIndex,
        timeSlot: TIME_SLOTS[slotIndex] || `Period ${slotIndex + 1}`,
        code,
        venue,
        name: subjectCodeToName[code] || code,
      });
    }
  });

  return slots;
}

export function calculateSimulatedSubject(
  subject: AttendanceShape,
  additionalAbsents: number
): SubjectSimulationResult {
  const originalAttended = subject.attended;
  const originalConducted = subject.conducted;
  const originalPercentage = subject.percentage;

  const simulatedAttended = originalAttended;
  const simulatedConducted = originalConducted + additionalAbsents;

  const odMlRate = subject.od_ml_percentage / 100;
  const odMlEquivalent = odMlRate * simulatedConducted;
  const totalEffectiveAttended = simulatedAttended + odMlEquivalent;

  const rawSimPct =
    simulatedConducted === 0
      ? 0
      : (totalEffectiveAttended / simulatedConducted) * 100;
  const simulatedPercentage = Number(rawSimPct.toFixed(2));
  const percentageDiff = Number(
    (simulatedPercentage - originalPercentage).toFixed(2)
  );

  const remaining = Math.floor(
    (0.25 * simulatedConducted - (simulatedConducted - totalEffectiveAttended)) /
      0.75
  );
  const remainingBunks = remaining > 0 ? remaining : 0;

  let classesNeeded = 0;
  if (simulatedPercentage < 75 && simulatedConducted > 0) {
    const needed = Math.ceil(
      (0.75 * simulatedConducted - totalEffectiveAttended) / (0.25 + odMlRate)
    );
    classesNeeded = needed > 0 ? needed : 0;
  }

  let status: "safe" | "warning" | "danger" = "safe";
  if (simulatedPercentage < 75) {
    status = "danger";
  } else if (simulatedPercentage <= 80) {
    status = "warning";
  }

  const droppedBelow75 = originalPercentage >= 75 && simulatedPercentage < 75;

  return {
    subject_code: subject.subject_code,
    subject_name: subject.subject_name || subject.subject_code,
    originalAttended,
    originalConducted,
    originalPercentage,
    simulatedAttended,
    simulatedConducted,
    simulatedPercentage,
    missedClasses: additionalAbsents,
    percentageDiff,
    classesNeeded,
    remainingBunks,
    status,
    droppedBelow75,
  };
}

export function calculateAbsenceSimulation(
  attendance: AttendanceShape[],
  timetable: TimetableEntry[],
  subjectCodeToName: Record<string, string>,
  absenceDates: SelectedAbsenceDate[]
): SimulationSummary {
  const missedCountMap = new Map<string, number>();

  absenceDates.forEach(({ dayName, selectedSlots }) => {
    const dayClasses = getClassesForDay(timetable, dayName, subjectCodeToName);
    selectedSlots.forEach((slotIndex) => {
      const cls = dayClasses.find((c) => c.slotIndex === slotIndex);
      if (cls && cls.code) {
        missedCountMap.set(
          cls.code,
          (missedCountMap.get(cls.code) || 0) + 1
        );
      }
    });
  });

  let totalMissed = 0;
  missedCountMap.forEach((count) => {
    totalMissed += count;
  });

  let origTotalAttended = 0;
  let origTotalConducted = 0;
  let simTotalAttended = 0;
  let simTotalConducted = 0;
  let criticalCount = 0;
  let affectedCount = 0;

  const subjectResults: SubjectSimulationResult[] = attendance.map((sub) => {
    const missed = missedCountMap.get(sub.subject_code) || 0;
    const sim = calculateSimulatedSubject(sub, missed);

    origTotalAttended += sub.attended;
    origTotalConducted += sub.conducted;
    simTotalAttended += sim.simulatedAttended;
    simTotalConducted += sim.simulatedConducted;

    if (sim.status === "danger") {
      criticalCount += 1;
    }
    if (missed > 0) {
      affectedCount += 1;
    }

    return sim;
  });

  const overallOriginalPercentage =
    origTotalConducted === 0
      ? 0
      : Number(((origTotalAttended / origTotalConducted) * 100).toFixed(2));
  const overallSimulatedPercentage =
    simTotalConducted === 0
      ? 0
      : Number(((simTotalAttended / simTotalConducted) * 100).toFixed(2));
  const overallPercentageDiff = Number(
    (overallSimulatedPercentage - overallOriginalPercentage).toFixed(2)
  );

  return {
    totalMissedClasses: totalMissed,
    overallOriginalPercentage,
    overallSimulatedPercentage,
    overallPercentageDiff,
    criticalSubjectsCount: criticalCount,
    affectedSubjectsCount: affectedCount,
    subjects: subjectResults,
  };
}
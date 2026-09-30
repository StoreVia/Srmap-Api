export type SimulationDayStatus = "absent" | "present";

export interface DayClassSlot {
  slotIndex: number;
  timeSlot: string;
  code: string;
  venue: string;
  name: string;
}

export interface SubjectSimulationResult {
  subject_code: string;
  subject_name: string;
  originalAttended: number;
  originalConducted: number;
  originalPercentage: number;
  simulatedAttended: number;
  simulatedConducted: number;
  simulatedPercentage: number;
  missedClasses: number;
  attendedClasses: number;
  percentageDiff: number;
  classesNeeded: number;
  remainingBunks: number;
  status: "safe" | "warning" | "danger";
  droppedBelow75: boolean;
}

export interface SimulationSummary {
  totalMissedClasses: number;
  totalAttendedClasses: number;
  overallOriginalPercentage: number;
  overallSimulatedPercentage: number;
  overallPercentageDiff: number;
  criticalSubjectsCount: number;
  affectedSubjectsCount: number;
  subjects: SubjectSimulationResult[];
}

export interface SelectedSimulationDate {
  date: string;
  dayName: string;
  status: SimulationDayStatus;
  selectedSlots?: number[];
}

export type SelectedAbsenceDate = SelectedSimulationDate;

export interface MultiDateSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDates: string[];
  dateStatusMap: Record<string, SimulationDayStatus>;
  simulationSummary: SimulationSummary;
  showAttendanceList?: boolean;
  onToggleDate: (dateStr: string) => void;
  onSetDateStatus: (dateStr: string, status: SimulationDayStatus) => void;
  onRemoveDate: (dateStr: string) => void;
  onReset: () => void;
}

export interface WhatIfAbsentButtonProps {
  isSimulationActive: boolean;
  selectedCount: number;
  onClick: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}
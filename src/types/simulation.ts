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
  percentageDiff: number;
  classesNeeded: number;
  remainingBunks: number;
  status: "safe" | "warning" | "danger";
  droppedBelow75: boolean;
}

export interface SimulationSummary {
  totalMissedClasses: number;
  overallOriginalPercentage: number;
  overallSimulatedPercentage: number;
  overallPercentageDiff: number;
  criticalSubjectsCount: number;
  affectedSubjectsCount: number;
  subjects: SubjectSimulationResult[];
}

export interface SelectedAbsenceDate {
  date: string;
  dayName: string;
  selectedSlots: number[];
}

export interface MultiDateSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDates: string[];
  simulationSummary: SimulationSummary;
  showAttendanceList?: boolean;
  onApply: (dates: string[]) => void;
  onReset: () => void;
}

export interface WhatIfAbsentButtonProps {
  isSimulationActive: boolean;
  selectedCount: number;
  onClick: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}
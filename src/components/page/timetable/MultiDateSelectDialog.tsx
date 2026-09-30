"use client";
import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RotateCcw,
  X,
  ShieldCheck,
  ShieldAlert,
  CalendarCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogWindowClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/functions";
import { getIsoDateString, formatReadableDate } from "@/shared/utils/attendanceSimulation";
import type {
  MultiDateSelectDialogProps,
  SubjectSimulationResult,
} from "@/types/simulation";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function MultiDateSelectDialog({
  open,
  onOpenChange,
  selectedDates,
  dateStatusMap,
  simulationSummary,
  showAttendanceList = true,
  onToggleDate,
  onSetDateStatus,
  onRemoveDate,
  onReset,
}: MultiDateSelectDialogProps) {
  const [currentViewDate, setCurrentViewDate] = React.useState<Date>(() => new Date());

  React.useEffect(() => {
    if (open) {
      if (selectedDates.length > 0) {
        const parts = selectedDates[0].split("-").map(Number);
        if (parts.length === 3) {
          setCurrentViewDate(new Date(parts[0], parts[1] - 1, 1));
        }
      } else {
        setCurrentViewDate(new Date());
      }
    }
  }, [open, selectedDates]);

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const prevMonth = () => {
    setCurrentViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentViewDate(new Date(year, month + 1, 1));
  };

  const todayStr = React.useMemo(() => getIsoDateString(new Date()), []);
  const tomorrowStr = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return getIsoDateString(d);
  }, []);

  const calendarDays = React.useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dateStr: getIsoDateString(prevDate),
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(year, month, d);
      days.push({
        dateStr: getIsoDateString(thisDate),
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    const remainingSlots = 42 - days.length;
    for (let d = 1; d <= remainingSlots; d++) {
      const nextDate = new Date(year, month + 1, d);
      days.push({
        dateStr: getIsoDateString(nextDate),
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[88vh] p-0 flex flex-col overflow-hidden bg-background">
        <DialogHeader className="p-4 border-b bg-slate-50 dark:bg-card flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  What If Simulation
                  {selectedDates.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-bold">
                      {selectedDates.length} Date{selectedDates.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Select dates and mark each day as Absent or Present
                </p>
              </div>
            </div>
            <DialogWindowClose />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={selectedDates.includes(todayStr) ? "secondary" : "outline"}
                size="sm"
                onClick={() => onToggleDate(todayStr)}
                className={cn(
                  "h-7 text-xs flex-1",
                  dateStatusMap[todayStr] === "absent" &&
                    "border-red-300 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
                  dateStatusMap[todayStr] === "present" &&
                    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                )}
              >
                Today
              </Button>
              <Button
                type="button"
                variant={selectedDates.includes(tomorrowStr) ? "secondary" : "outline"}
                size="sm"
                onClick={() => onToggleDate(tomorrowStr)}
                className={cn(
                  "h-7 text-xs flex-1",
                  dateStatusMap[tomorrowStr] === "absent" &&
                    "border-red-300 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
                  dateStatusMap[tomorrowStr] === "present" &&
                    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                )}
              >
                Tomorrow
              </Button>
              {selectedDates.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  className="h-7 text-xs px-2 text-muted-foreground hover:text-destructive"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-border p-3 bg-card shadow-sm">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-bold text-sm">
                  {MONTH_NAMES[month]} {year}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={prevMonth}
                    className="h-7 w-7"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={nextMonth}
                    className="h-7 w-7"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                {DAY_LABELS.map((d) => (
                  <span
                    key={d}
                    className="text-[11px] font-semibold text-muted-foreground uppercase py-0.5"
                  >
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(({ dateStr, dayNum, isCurrentMonth }) => {
                  const status = dateStatusMap[dateStr];
                  const isSelected = Boolean(status);
                  const isToday = dateStr === todayStr;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => onToggleDate(dateStr)}
                      className={cn(
                        "h-9 w-full rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center relative",
                        !isCurrentMonth && "text-muted-foreground/40",
                        isCurrentMonth && !isSelected && "text-foreground hover:bg-muted",
                        isToday && !isSelected && "font-bold text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800",
                        status === "absent" && "bg-red-600 text-white font-bold shadow-sm hover:bg-red-700",
                        status === "present" && "bg-emerald-600 text-white font-bold shadow-sm hover:bg-emerald-700"
                      )}
                    >
                      <span>{dayNum}</span>
                      {isToday && (
                        <span
                          className={cn(
                            "w-1 h-1 rounded-full absolute bottom-1",
                            isSelected ? "bg-white" : "bg-blue-600 dark:bg-blue-400"
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDates.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
                  <span className="font-semibold text-foreground">
                    Selected Dates ({selectedDates.length})
                  </span>
                  <span>Choose Absent / Present for each date</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                  {selectedDates.map((dateStr) => {
                    const status = dateStatusMap[dateStr] || "absent";
                    return (
                      <div
                        key={dateStr}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card/60"
                      >
                        <span className="text-xs font-medium text-foreground">
                          {formatReadableDate(dateStr)}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <div className="flex rounded-md p-0.5 bg-slate-200/80 dark:bg-muted">
                            <button
                              type="button"
                              onClick={() => onSetDateStatus(dateStr, "absent")}
                              className={cn(
                                "px-2.5 py-0.5 text-[11px] font-bold rounded transition-all",
                                status === "absent"
                                  ? "bg-red-600 text-white shadow-xs"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => onSetDateStatus(dateStr, "present")}
                              className={cn(
                                "px-2.5 py-0.5 text-[11px] font-bold rounded transition-all",
                                status === "present"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              Present
                            </button>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onRemoveDate(dateStr)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {showAttendanceList && (
            <div className="pt-3 border-t space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Projected Attendance
                </span>
                <div className="flex items-center gap-2 text-[11px] font-semibold">
                  {simulationSummary.totalAttendedClasses > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{simulationSummary.totalAttendedClasses} Present
                    </span>
                  )}
                  {simulationSummary.totalMissedClasses > 0 && (
                    <span className="text-red-500">
                      +{simulationSummary.totalMissedClasses} Absent
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {simulationSummary.subjects.map((sub) => (
                  <SubjectAttendanceItem key={sub.subject_code} subject={sub} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-slate-50 dark:bg-card flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SubjectAttendanceItem({ subject }: { subject: SubjectSimulationResult }) {
  const hasChanges = subject.missedClasses > 0 || subject.attendedClasses > 0;
  const pctColor =
    subject.simulatedPercentage < 75
      ? "text-red-500"
      : subject.simulatedPercentage <= 80
      ? "text-amber-500"
      : "text-blue-500";

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all flex flex-col justify-between gap-1.5",
        subject.missedClasses > 0
          ? "border-red-200 bg-red-50/30 dark:border-red-900/40 dark:bg-red-950/20"
          : subject.attendedClasses > 0
          ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20"
          : "border-slate-200 bg-slate-50/50 dark:border-border dark:bg-card/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="secondary" className="font-mono text-[11px] px-1.5 py-0">
              {subject.subject_code}
            </Badge>
            {subject.attendedClasses > 0 && (
              <Badge
                variant="outline"
                className="text-[9px] px-1 py-0 font-bold uppercase border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
              >
                +{subject.attendedClasses} Present
              </Badge>
            )}
            {subject.missedClasses > 0 && (
              <Badge
                variant="destructive"
                className="text-[9px] px-1 py-0 font-bold uppercase"
              >
                +{subject.missedClasses} Absent
              </Badge>
            )}
          </div>
          <div className="font-semibold text-xs sm:text-sm truncate mt-1 text-foreground">
            {subject.subject_name}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className={cn("text-base sm:text-lg font-black", pctColor)}>
            {subject.simulatedPercentage}%
          </div>
          {hasChanges && subject.percentageDiff !== 0 && (
            <div
              className={cn(
                "text-[11px] font-semibold",
                subject.percentageDiff > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
              )}
            >
              {subject.percentageDiff > 0 ? `+${subject.percentageDiff}%` : `${subject.percentageDiff}%`}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-slate-200/60 dark:border-border/60">
        <span>
          Attended:{" "}
          <strong className="text-foreground">
            {subject.simulatedAttended} / {subject.simulatedConducted}
          </strong>
        </span>

        {subject.classesNeeded > 0 ? (
          <span className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 shrink-0" />
            Attend {subject.classesNeeded} to reach 75%
          </span>
        ) : (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            {subject.remainingBunks} safe bunk(s)
          </span>
        )}
      </div>
    </div>
  );
}
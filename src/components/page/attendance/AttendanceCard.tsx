"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import AttendanceDialog from "./OdMlDialog";
import SimulationDialog from "./SimulationDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface Subject {
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

const AttendanceCard = ({
  subject,
  isPredictedChanged = false,
}: {
  subject: Subject;
  isPredictedChanged?: boolean;
}) => {
  const [simulatedBunks, setSimulatedBunks] = useState(0);
  const [futureAttendedClasses, setFutureAttendedClasses] = useState(0);
  const [simulatedPercentage, setSimulatedPercentage] = useState(0);
  const [classesNeeded, setClassesNeeded] = useState(0);
  const [remainingBunks, setRemainingBunks] = useState(0);
  const [absentClasses, setAbsentClasses] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [bunksDialogOpen, setBunksDialogOpen] = useState(false);
  const [futureDialogOpen, setFutureDialogOpen] = useState(false);

  useEffect(() => {
    setSimulatedPercentage(subject.percentage);
  }, [subject]);

  useEffect(() => {
    const odMlRate = subject.od_ml_percentage / 100;

    const totalConducted = subject.conducted + simulatedBunks + futureAttendedClasses;
    const totalAttended = subject.attended + futureAttendedClasses;

    const odMlEquivalentClasses = odMlRate * totalConducted;
    const totalEffectiveAttended = totalAttended + odMlEquivalentClasses;

    const effectivePercentage =
      totalConducted === 0 ? 0 : (totalEffectiveAttended / totalConducted) * 100;
    setSimulatedPercentage(effectivePercentage);

    const absent = totalConducted - totalAttended;
    setAbsentClasses(absent);

    const remaining = Math.floor(
      (0.25 * totalConducted - (totalConducted - totalEffectiveAttended)) / 0.75
    );
    setRemainingBunks(remaining > 0 ? remaining : 0);

    if (effectivePercentage >= 75 || totalConducted === 0) {
      setClassesNeeded(0);
    } else {
      const needed = Math.ceil(
        (0.75 * totalConducted - totalEffectiveAttended) / (0.25 + odMlRate)
      );
      setClassesNeeded(needed > 0 ? needed : 0);
    }
  }, [simulatedBunks, futureAttendedClasses, subject]);

  const handlePlanBunks = (bunks: number) => {
    setSimulatedBunks(bunks);
  };

  const handleFutureAttendance = (futureAttend: number) => {
    setFutureAttendedClasses(futureAttend);
  };

  const handleRevertChanges = () => {
    setIsRotating(true);
    setSimulatedBunks(0);
    setFutureAttendedClasses(0);
    setTimeout(() => setIsRotating(false), 600);
  };

  const displayedTotal = subject.conducted + simulatedBunks + futureAttendedClasses;
  const displayedAttended = subject.attended + futureAttendedClasses;
  const hasSimulations = simulatedBunks > 0 || futureAttendedClasses > 0;

  const percentageColor =
    simulatedPercentage < 75
      ? "text-red-500"
      : simulatedPercentage <= 80
      ? "text-orange-500"
      : "text-blue-500";

  return (
    <>
      <Card
        className={`overflow-hidden transition-all duration-200 border-border/80 ${
          isPredictedChanged ? "border-blue-500 ring-1 ring-blue-500/20" : ""
        }`}
      >
        {isPredictedChanged && (
          <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
        )}

        <CardContent className="p-3 sm:p-3.5 space-y-2.5">
          {/* Top Header: Title, Code & Percentage */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate leading-snug">
                {subject.subject_name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-muted-foreground font-mono font-medium">
                  {subject.subject_code}
                </span>
                {isPredictedChanged && (
                  <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Predicted
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <div className="bg-muted px-2 py-1 rounded-md">
                <span className={`text-sm font-bold tabular-nums ${percentageColor}`}>
                  {simulatedPercentage.toFixed(2)}%
                </span>
              </div>
              <AttendanceDialog subject={subject} />
            </div>
          </div>

          {/* Compact Progress Bar */}
          <div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  simulatedPercentage < 75
                    ? "bg-red-500"
                    : simulatedPercentage <= 80
                    ? "bg-orange-500"
                    : "bg-blue-600"
                }`}
                style={{ width: `${Math.min(simulatedPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-medium">
              <span>Min: 75%</span>
              <span className="tabular-nums">Current: {simulatedPercentage.toFixed(2)}%</span>
            </div>
          </div>

          {/* Compact 2x2 Stats Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-muted/70 px-2 py-1.5 rounded-md">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Present</p>
              <p className="text-base font-bold text-green-600 dark:text-green-500 mt-1 tabular-nums leading-none">
                {displayedAttended}
              </p>
            </div>
            <div className="bg-muted/70 px-2 py-1.5 rounded-md">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Absent</p>
              <p className="text-base font-bold text-red-600 dark:text-red-500 mt-1 tabular-nums leading-none">
                {absentClasses}
              </p>
            </div>
            <div className="bg-muted/70 px-2 py-1.5 rounded-md">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Total</p>
              <p className="text-base font-bold text-foreground mt-1 tabular-nums leading-none">
                {displayedTotal}
              </p>
            </div>
            <div className="bg-muted/70 px-2 py-1.5 rounded-md">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Can Skip</p>
              <p className="text-base font-bold text-foreground mt-1 tabular-nums leading-none">
                {remainingBunks}
              </p>
            </div>

            {/* Need to Attend / Status Row */}
            {simulatedPercentage < 75 && (
              <div className="bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-md col-span-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">Need to Attend</span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400 tabular-nums">
                  {classesNeeded} {classesNeeded === 1 ? "class" : "classes"}
                </span>
              </div>
            )}
          </div>

          {/* Compact Action Buttons */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <Button
              type="button"
              onClick={() => setBunksDialogOpen(true)}
              className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-xs"
            >
              Plan Bunks
            </Button>
            <Button
              type="button"
              onClick={() => setFutureDialogOpen(true)}
              className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-xs"
            >
              Future
            </Button>
            {hasSimulations && (
              <Button
                type="button"
                onClick={handleRevertChanges}
                variant="ghost"
                size="icon"
                title="Reset simulation"
                className={`h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:text-foreground ${
                  isRotating ? "animate-spin" : ""
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <SimulationDialog
        isOpen={bunksDialogOpen}
        onClose={() => setBunksDialogOpen(false)}
        onConfirm={handlePlanBunks}
        title="Plan Your Bunks"
        description="Enter the number of classes you want to bunk."
        inputLabel="Number of classes to bunk"
        buttonText="Apply Bunks"
      />

      <SimulationDialog
        isOpen={futureDialogOpen}
        onClose={() => setFutureDialogOpen(false)}
        onConfirm={handleFutureAttendance}
        title="Future Attendance"
        description="Enter the number of classes you plan to attend in the future."
        inputLabel="Number of classes to attend"
        buttonText="Apply Future Attendance"
      />
    </>
  );
};

export default AttendanceCard;
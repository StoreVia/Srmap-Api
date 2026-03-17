"use client";
import { RotateCcw } from "lucide-react";
import AttendanceDialog from "./OdMlDialog";
import { Button } from "@/components/ui/button";
import SimulationDialog from "./SimulationDialog";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const AttendanceCard = ({ subject }: { subject: Subject }) => {
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
    const totalConducted = subject.conducted + simulatedBunks + futureAttendedClasses;
    const totalAttended = subject.attended + futureAttendedClasses;

    const odMlEquivalentClasses = (subject.od_ml_percentage / 100) * totalConducted;
    const totalEffectiveAttended = totalAttended + odMlEquivalentClasses;

    const effectivePercentage = totalConducted === 0 ? 0 : (totalEffectiveAttended / totalConducted) * 100;
    setSimulatedPercentage(Math.round(effectivePercentage));

    const absent = totalConducted - totalAttended;
    setAbsentClasses(absent);

    const remaining = Math.floor((0.25 * totalConducted - (totalConducted - totalEffectiveAttended)) / 0.75);
    setRemainingBunks(remaining > 0 ? remaining : 0);

    if (effectivePercentage >= 75 || totalConducted === 0) {
      setClassesNeeded(0);
    } else {
      const needed = Math.ceil((0.75 * totalConducted - totalEffectiveAttended) / 0.25);
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

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="max-w-[70%]">
              <CardTitle className="text-lg">{subject.subject_name}</CardTitle>
              <p className="text-muted-foreground text-xs">{subject.subject_code}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{simulatedPercentage.toFixed(0)}%</span>
              <AttendanceDialog subject={subject} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${simulatedPercentage < 75 ? "bg-red-600" : simulatedPercentage <= 80 ? "bg-orange-500" : "bg-blue-600"
                  }`}
                style={{ width: `${Math.min(simulatedPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span>Min: 75%</span>
              <span>Current: {simulatedPercentage.toFixed(0)}%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted p-2 rounded">
              <p className="text-xs">Present</p>
              <p className="text-lg font-bold text-green-600">{displayedAttended}</p>
            </div>
            <div className="bg-muted p-2 rounded">
              <p className="text-xs">Absent</p>
              <p className="text-lg font-bold text-red-600">{absentClasses}</p>
            </div>
            <div className="bg-muted p-2 rounded">
              <p className="text-xs">Total</p>
              <p className="text-lg font-bold">{displayedTotal}</p>
            </div>
            <div className="bg-muted p-2 rounded">
              <p className="text-xs">Can Skip</p>
              <p className="text-lg font-bold">{remainingBunks}</p>
            </div>
            {simulatedPercentage < 75 && (
              <div className="bg-muted p-2 rounded col-span-2">
                <p className="text-xs">Need to Attend</p>
                <p className="text-lg font-bold">{classesNeeded}</p>
              </div>
            )}
          </div>
          <div className="bg-muted p-3 rounded">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Calculators</p>
              {hasSimulations && (
                <Button onClick={handleRevertChanges} variant="ghost" size="sm" className={`p-1 h-7 w-7 ${isRotating ? "animate-spin" : ""}`}>
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setBunksDialogOpen(true)}
                className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Plan Bunks
              </Button>
              <Button
                onClick={() => setFutureDialogOpen(true)}
                className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Future
              </Button>
            </div>
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
"use client";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Subject } from "./AttendanceCard";
import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

const AttendanceDialog = ({ subject }: { subject: Subject }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-7 w-7">
                    <Info className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold">{subject.subject_name}</h3>
                    <p className="text-muted-foreground text-sm">{subject.subject_code}</p>

                    <div className="space-y-3">
                        <div className="bg-blue-50 dark:bg-blue-700 p-3 rounded border border-blue-200 dark:border-blue-600">
                            <p className="text-xs font-medium text-blue-800 dark:text-blue-100">OD/ML Percentage</p>
                            <p className="text-lg font-bold text-blue-900 dark:text-blue-50">{subject.od_ml_percentage}%</p>
                        </div>

                        <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded border border-blue-300 dark:border-blue-700">
                            <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Present Percentage</p>
                            <p className="text-lg font-bold text-blue-900 dark:text-blue-50">{subject.present_percentage}%</p>
                        </div>

                        <div className="bg-green-50 dark:bg-green-800 p-3 rounded border border-green-200 dark:border-green-700">
                            <p className="text-xs font-medium text-green-800 dark:text-green-100">Total Attendance Percentage</p>
                            <p className="text-xl font-bold text-green-700 dark:text-green-50">{subject.percentage}%</p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose>
                        <Button>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AttendanceDialog;
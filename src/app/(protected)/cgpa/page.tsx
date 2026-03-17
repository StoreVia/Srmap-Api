"use client";
import { X, Plus } from "lucide-react";
import { toast } from "@/hooks/useToast";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStudentData } from "@/context/StudentContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Subject = {
    id: string;
    name: string;
    credits: number;
    grade: string;
};

const gradePoints = {
    "O": 10,
    "A+": 9,
    "A": 8,
    "B+": 7,
    "B": 6,
    "C": 5,
    "P": 4,
    "F": 0,
};

const romanMap = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    X: 10,
    XI: 11,
    XII: 12,
    XIII: 13,
    XIV: 14,
    XV: 15,
    XVI: 16,
    XVII: 17,
    XVIII: 18,
    XIX: 19,
    XX: 20
} as const;

type GradeKey = keyof typeof gradePoints;
type RomanKey = keyof typeof romanMap;

const CGPACalculator = () => {
    const { profile, cgpa, subjects } = useStudentData();

    const currentCGPA = cgpa || "0.00";
    const extractSemester = (str: string) => {
        const key = str.split(" ")[0] as RomanKey;
        return Number(romanMap[key]) || 1;
    };

    const contextSubjects = subjects.map((s) => ({
        id: s.code,
        name: s.name,
        credits: Number(s.credit) || 0,
        grade: ""
    }));

    const [isManualMode, setIsManualMode] = useState(false);
    const [localSubjects, setLocalSubjects] = useState<Subject[]>([]);
    const [calculatedSGPA, setCalculatedSGPA] = useState("0.00");
    const [calculatedCGPA, setCalculatedCGPA] = useState(currentCGPA);

    useEffect(() => {
        if (!isManualMode && subjects.length > 0) {
            setLocalSubjects(contextSubjects.map((s) => ({ ...s, grade: "" })));
        }
    }, [subjects, isManualMode]);

    useEffect(() => {
        if (isManualMode) {
            setLocalSubjects([]);
        } else if (subjects.length > 0) {
            setLocalSubjects(contextSubjects.map((s) => ({ ...s, grade: "" })));
        }
        setCalculatedSGPA("0.00");
        setCalculatedCGPA(currentCGPA);
    }, [isManualMode]);

    const semesterNumber = extractSemester(profile?.semester || "");

    const addNewSubject = () => {
        const newId = `manual-${Date.now()}`;
        setLocalSubjects([
            ...localSubjects,
            { id: newId, name: "", credits: 3, grade: "" }
        ]);
    };

    const removeSubject = (id: string) => {
        setLocalSubjects(localSubjects.filter((subject) => subject.id !== id));
    };

    const updateSubject = (id: string, field: string, value: string | number) => {
        setLocalSubjects(
            localSubjects.map((subject) =>
                subject.id === id ? { ...subject, [field]: value } : subject
            )
        );
    };

    const calculateSGPA = () => {
        let totalCredits = 0;
        let totalGradePoints = 0;

        localSubjects.forEach((subject: any) => {
            if (subject.grade && subject.grade in gradePoints) {
                const points = gradePoints[subject.grade as GradeKey];
                totalCredits += Number(subject.credits);
                totalGradePoints += points * Number(subject.credits);
            }
        });

        return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : "0.00";
    };

    const calculateCGPA = (sgpaValue: any) => {
        const sgpa = parseFloat(sgpaValue);
        const currentCGPAValue = Number(currentCGPA);
        const n = semesterNumber;
        if (extractSemester(profile?.semester || "") === 1) {
            return sgpa.toFixed(2);
        }
        const newCGPA = (currentCGPAValue * (n - 1) + sgpa) / n;
        return newCGPA.toFixed(2);
    };

    const resetSubjects = () => {
        if (isManualMode) {
            setLocalSubjects([]);
        } else {
            setLocalSubjects(contextSubjects.map((s) => ({ ...s, grade: "" })));
        }
        setCalculatedSGPA("0.00");
        setCalculatedCGPA(currentCGPA);
    };

    const performCalculation = () => {
        const newSGPA = calculateSGPA();
        if (Number(newSGPA) === 0.00) {
            toast({
                title: "Error",
                description: "Atleast Add One Credit For One Subject!",
                variant: "destructive",
            });
            return;
        }
        setCalculatedSGPA(newSGPA);
        setCalculatedCGPA(calculateCGPA(newSGPA));
    };

    return (
        <div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl">
                                    {isManualMode ? "Manual Mode" : "Auto Subjects Fill Mode"}
                                </CardTitle>
                                <CardDescription>
                                    {isManualMode
                                        ? "Add Your Subjects And Grades"
                                        : "All Subjects All Already Filled Just Mark Your Expected Grades"}
                                </CardDescription>
                            </div>
                            <Button
                                variant={isManualMode ? "default" : "outline"}
                                onClick={() => setIsManualMode(!isManualMode)}
                            >
                                {isManualMode ? "Auto Mode" : "Manual Mode"}
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Current Academic Status</CardTitle>
                        <CardDescription>Your Current Semester And CGPA</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Current Semester</h3>
                                <p className="text-xl font-bold">{profile?.semester || "Not available"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Current CGPA</h3>
                                <p className="text-xl font-bold">{Number(currentCGPA)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Subjects</CardTitle>
                                <CardDescription>Enter Your Grades For Each Subject</CardDescription>
                            </div>
                            {isManualMode && (
                                <Button onClick={addNewSubject} size="sm" className="bg-university-700 hover:bg-university-800">
                                    <Plus className="h-4 w-4 mr-1" /> Add Subject
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
                                <div className="col-span-6">Subject</div>
                                <div className="col-span-2">Credits</div>
                                <div className="col-span-3">Grade</div>
                                <div className="col-span-1"></div>
                            </div>

                            {localSubjects.length > 0 ? (
                                localSubjects.map((subject) => (
                                    <div
                                        key={subject.id}
                                        className="grid grid-cols-12 gap-4 items-center"
                                    >
                                        <div className="col-span-6">
                                            {isManualMode ? (
                                                <Input
                                                    value={subject.name}
                                                    onChange={(e) =>
                                                        updateSubject(subject.id, "name", e.target.value)
                                                    }
                                                    placeholder="Enter subject name"
                                                />
                                            ) : (
                                                <span className="text-sm font-medium">{subject.name}</span>
                                            )}
                                        </div>

                                        <div className="col-span-2">
                                            {isManualMode ? (
                                                <Input
                                                    type="number"
                                                    value={subject.credits}
                                                    onChange={(e) =>
                                                        updateSubject(subject.id, "credits", Number(e.target.value) || 0)
                                                    }
                                                    min={1}
                                                    max={6}
                                                />
                                            ) : (
                                                <span className="text-sm">{subject.credits}</span>
                                            )}
                                        </div>

                                        <div className="col-span-3">
                                            <Select
                                                value={subject.grade}
                                                onValueChange={(value) =>
                                                    updateSubject(subject.id, "grade", value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select grade" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="O">O (10)</SelectItem>
                                                    <SelectItem value="A+">A+ (9)</SelectItem>
                                                    <SelectItem value="A">A (8)</SelectItem>
                                                    <SelectItem value="B+">B+ (7)</SelectItem>
                                                    <SelectItem value="B">B (6)</SelectItem>
                                                    <SelectItem value="C">C (5)</SelectItem>
                                                    <SelectItem value="P">P (4)</SelectItem>
                                                    <SelectItem value="F">F (0)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="col-span-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSubject(subject.id)}
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                    {isManualMode ? (
                                        <p>No Subjects Added, Click "Add Subject" Button To Add Subjects Manually..</p>
                                    ) : (
                                        <p>No Subjects Avilable In Your Profile.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-university-700 dark:text-university-300">{calculatedSGPA}</div>
                                <div className="text-sm text-muted-foreground">Current SGPA</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{Number(calculatedCGPA)}</div>
                                <div className="text-sm text-muted-foreground">New CGPA</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {localSubjects.reduce((sum, s) => sum + Number(s.credits), 0)}
                                </div>
                                <div className="text-sm text-muted-foreground">Total Credits</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {localSubjects.filter((s) => s.grade).length}/{localSubjects.length}
                                </div>
                                <div className="text-sm text-muted-foreground">Subjects Graded</div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-3 sm:space-y-0 items-center">
                            <Button
                                onClick={performCalculation}
                                className="w-full sm:w-auto bg-university-700 hover:bg-university-800 dark:bg-university-500 dark:hover:bg-university-600 text-white dark:text-white"
                            >
                                Calculate SGPA & CGPA
                            </Button>
                            <Button
                                variant="outline"
                                onClick={resetSubjects}
                                className="w-full sm:w-auto"
                            >
                                Reset All Grades
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CGPACalculator;
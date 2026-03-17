"use client";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import API from "@/components/client/api/AxiosClient";
import SessionCard from "@/components/utils/SessionCard";
import { useSessionValidator } from "@/hooks/useSessionValidator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, BookOpen, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Exam {
  name: string;
  conducted_obtained: string;
  conducted_max: string;
  converted_obtained: string;
  converted_max: string;
}

interface Subject {
  subject_code: string;
  subject_name: string;
  marks_obtained: string;
  max_marks: string;
  exams: Exam[];
}

interface InternalMarksResponse {
  success: boolean;
  message: string;
  internals: {
    last_fetched: string;
    subjects: Subject[];
  };
}

interface ProcessedAssessment {
  type: string;
  conducted: string;
  converted: string;
}

interface ProcessedSubject {
  code: string;
  name: string;
  totalMarksObtained: number;
  totalMaxMarks: number;
  assessments: ProcessedAssessment[];
}

const SkeletonCard = () => (
  <Card className="animate-pulse">
    <CardHeader className="pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg border bg-muted h-10 w-10" />

          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-3 w-40 bg-muted rounded" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-5 w-20 bg-muted rounded" />
          <div className="h-4 w-4 bg-muted rounded" />
        </div>
      </div>
    </CardHeader>
  </Card>
);

const InternalMarks: React.FC = () => {
  const { toast } = useToast();
  const { sessionValid, sessionId } = useSessionValidator();

  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [data, setData] = useState<ProcessedSubject[]>([]);
  const [lastFetched, setLastFetched] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const processSubjects = (subjects: Subject[]): ProcessedSubject[] => {
    return subjects.map((subject) => ({
      code: subject.subject_code,
      name: subject.subject_name,
      totalMarksObtained: Number(subject.marks_obtained) || 0,
      totalMaxMarks: Number(subject.max_marks) || 0,
      assessments: subject.exams.map((exam) => ({
        type: exam.name,
        conducted:
          exam.conducted_obtained || exam.conducted_max
            ? `${exam.conducted_obtained}${exam.conducted_max ? " / " + exam.conducted_max : ""}`
            : "",
        converted:
          exam.converted_obtained || exam.converted_max
            ? `${exam.converted_obtained}${exam.converted_max ? " / " + exam.converted_max : ""}`
            : "",
      })),
    }));
  };

  const fetchInternalMarks = async () => {
    if (!sessionValid) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await API.post<InternalMarksResponse>("/srmapi/exams/internals", { sessionId });
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch internal marks");
      }
      setData(processSubjects(res.data.internals.subjects));
      setLastFetched(res.data.internals.last_fetched);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Failed to fetch internal marks";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionValid) {
      fetchInternalMarks();
    }
  }, [sessionValid]);

  const toggleSubject = (code: string) => {
    const updated = new Set(expandedSubjects);
    updated.has(code) ? updated.delete(code) : updated.add(code);
    setExpandedSubjects(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {lastFetched && (
          <p className="text-sm text-muted-foreground">Last fetched: {lastFetched}</p>
        )}
        {sessionValid && (
          <Button onClick={fetchInternalMarks} disabled={isLoading} className="flex items-center gap-2">
            <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refetch
          </Button>
        )}
      </div>

      {!sessionValid && (
        <Card>
          <CardHeader>
            <CardTitle>Session Required</CardTitle>
            <CardDescription>Initiate a session to view internal marks</CardDescription>
          </CardHeader>
          <CardContent>
            <SessionCard />
          </CardContent>
        </Card>
      )}

      {error && sessionValid && (
        <Card className="border-destructive">
          <CardContent className="pt-6 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {sessionValid && !isLoading && data.length > 0 && (
          <div className="space-y-4">
            {data.map((subject) => (
              <motion.div
                key={subject.code}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card className="hover:shadow-lg transition">
                  <CardHeader className="cursor-pointer" onClick={() => toggleSubject(subject.code)}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold">{subject.code}</CardTitle>
                          <p className="text-sm text-muted-foreground">{subject.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">
                          {subject.totalMarksObtained}
                          <span className="text-muted-foreground text-sm">/{subject.totalMaxMarks}</span>
                        </span>
                        {expandedSubjects.has(subject.code) ? <ChevronUp /> : <ChevronDown />}
                      </div>
                    </div>
                  </CardHeader>

                  {expandedSubjects.has(subject.code) && (
                    <CardContent className="border-t space-y-3">
                      {subject.assessments.map((a, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="p-4 rounded-lg border bg-muted/30 mt-4"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Calendar className="h-3 w-3" />
                            {a.type}
                          </div>
                          <div className="text-xs mt-1">
                            {a.conducted && <div>Conducted: <b>{a.conducted}</b></div>}
                            {a.converted && <div>Converted: <b>{a.converted}</b></div>}
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {sessionValid && !isLoading && data.length === 0 && !error && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No internal marks available.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InternalMarks;
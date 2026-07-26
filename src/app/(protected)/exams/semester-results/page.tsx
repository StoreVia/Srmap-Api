"use client";

import React, { useEffect, useMemo, useState } from "react";
import API from "@/lib/api/axiosClient";
import SessionCard from "@/components/utils/SessionCard";
import { useToast } from "@/hooks/utils/useToast";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/utils/useMobile";
import { useSessionValidator } from "@/hooks/auth/useSessionValidator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Trophy } from "lucide-react";

interface LedgerRow {
  semester: string;
  month_year: string;
  subject_code: string;
  subject_description: string;
  credit: string;
  grade: string;
  grade_points: string;
  result: string;
  attempt: string;
}

interface LedgerPayload {
  last_fetched: string;
  cgpa: string;
  rows: LedgerRow[];
}

interface LedgerResponse {
  success: boolean;
  message: string;
  semester_results: LedgerPayload;
}

const SemesterResultsPage: React.FC = () => {
  const { toast } = useToast();
  const { sessionValid, sessionId } = useSessionValidator();
  const isMobile = useIsMobile();

  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [cgpa, setCgpa] = useState("");
  const [lastFetched, setLastFetched] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const semesters = useMemo(() => {
    const values = Array.from(new Set(rows.map((r) => r.semester).filter(Boolean)));
    return values.sort((a, b) => Number(a) - Number(b));
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (selectedSemester === "all") return rows;
    return rows.filter((row) => row.semester === selectedSemester);
  }, [rows, selectedSemester]);

  const calculatedCgpa = useMemo(() => {
    const validRows = filteredRows.filter((row) => {
      const credit = Number(row.credit);
      const gradePoints = Number(row.grade_points);
      return !Number.isNaN(credit) && !Number.isNaN(gradePoints) && credit > 0;
    });

    if (validRows.length === 0) return "";

    const totalCredits = validRows.reduce((sum, row) => sum + Number(row.credit), 0);
    if (totalCredits <= 0) return "";

    const totalWeightedPoints = validRows.reduce(
      (sum, row) => sum + Number(row.credit) * Number(row.grade_points),
      0
    );

    return (totalWeightedPoints / totalCredits).toFixed(2);
  }, [filteredRows]);

  const fetchSemesterResults = async () => {
    if (!sessionValid) return;

    setIsLoading(true);
    setError("");
    try {
      const res = await API.post<LedgerResponse>("/srmapi/exams/semester-results", { sessionId });
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch semester results");
      }

      const payload = res.data.semester_results;
      const nextRows = payload?.rows || [];
      const nextSemesters = Array.from(new Set(nextRows.map((r) => r.semester).filter(Boolean)));

      setRows(nextRows);
      setCgpa(payload?.cgpa || "");
      setLastFetched(payload?.last_fetched || "");

      if (selectedSemester !== "all" && !nextSemesters.includes(selectedSemester)) {
        setSelectedSemester("all");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Failed to fetch semester results";
      setError(msg);
      setRows([]);
      setCgpa("");
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionValid) {
      fetchSemesterResults();
    }
  }, [sessionValid]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {lastFetched && <p className="text-sm text-muted-foreground">Last fetched: {lastFetched}</p>}
        {sessionValid && (
          <Button onClick={fetchSemesterResults} disabled={isLoading} className="flex items-center gap-2">
            <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refetch
          </Button>
        )}
      </div>

      {!sessionValid && (
        <Card>
          <CardHeader>
            <CardTitle>Session Required</CardTitle>
            <CardDescription>Initiate a session to view semester results</CardDescription>
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

      {sessionValid && !isLoading && !error && (
        <Card>
          <CardContent className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSemester === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSemester("all")}
              >
                All Semesters
              </Button>
              {semesters.map((semester) => (
                <Button
                  key={semester}
                  variant={selectedSemester === semester ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSemester(semester)}
                >
                  Sem {semester}
                </Button>
              ))}
            </div>

            <div className="rounded-lg border bg-muted/10 p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedSemester === "all" ? "Calculated CGPA" : `Calculated Semester ${selectedSemester} CGPA`}
              </span>
              <span className="text-xl font-bold text-primary">{calculatedCgpa || "-"}</span>
            </div>

            {selectedSemester === "all" && cgpa && (
              <p className="text-xs text-muted-foreground">
                Official portal CGPA: <b>{cgpa}</b>
              </p>
            )}

            {rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No exam mark details are available right now.
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No records found for the selected semester.
              </div>
            ) : isMobile ? (
              <div className="space-y-3">
                {filteredRows.map((row, index) => (
                  <div
                    key={`${row.subject_code}-${row.month_year}-${index}`}
                    className="rounded-lg border p-3 bg-background space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{row.subject_code}</p>
                        <p className="text-xs text-muted-foreground">
                          Sem {row.semester} • {row.month_year}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {row.result || "-"}
                      </span>
                    </div>
                    <p className="text-sm leading-snug">{row.subject_description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md bg-muted/40 p-2">Grade: <b>{row.grade || "-"}</b></div>
                      <div className="rounded-md bg-muted/40 p-2">Points: <b>{row.grade_points || "-"}</b></div>
                      <div className="rounded-md bg-muted/40 p-2">Credit: <b>{row.credit || "-"}</b></div>
                      <div className="rounded-md bg-muted/40 p-2">Attempt: <b>{row.attempt || "-"}</b></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-sm border rounded-md">
                <thead>
                  <tr className="bg-muted/40 text-left">
                    <th className="p-2 border-b">Sem</th>
                    <th className="p-2 border-b">Month & Year</th>
                    <th className="p-2 border-b">Code</th>
                    <th className="p-2 border-b">Description</th>
                    <th className="p-2 border-b">Credit</th>
                    <th className="p-2 border-b">Grade</th>
                    <th className="p-2 border-b">Grade Points</th>
                    <th className="p-2 border-b">Result</th>
                    <th className="p-2 border-b">Attempt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => (
                    <tr key={`${row.subject_code}-${row.month_year}-${index}`} className="odd:bg-muted/10">
                      <td className="p-2 border-b">{row.semester}</td>
                      <td className="p-2 border-b">{row.month_year}</td>
                      <td className="p-2 border-b">{row.subject_code}</td>
                      <td className="p-2 border-b">{row.subject_description}</td>
                      <td className="p-2 border-b">{row.credit}</td>
                      <td className="p-2 border-b">{row.grade}</td>
                      <td className="p-2 border-b">{row.grade_points}</td>
                      <td className="p-2 border-b">{row.result}</td>
                      <td className="p-2 border-b">{row.attempt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SemesterResultsPage;

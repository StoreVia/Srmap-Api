"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, BookOpen, Calendar, CalendarCheck, Clock, RefreshCw } from "lucide-react";
import API from "@/lib/api/axiosClient";
import { useToast } from "@/hooks/utils/useToast";
import { cn } from "@/shared/utils/functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SessionCard from "@/components/utils/SessionCard";

interface AttendanceItem {
  date: string;
  day: string;
  hour: string;
  subject: string;
  status: string;
}

type AttendanceCheckCardProps = {
  sessionValid: boolean;
  sessionId: string;
  refreshKey?: number;
};

const SkeletonCard = () => (
  <Card className="animate-pulse">
    <CardHeader className="pb-4">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg border bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-36 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      </div>
    </CardHeader>
  </Card>
);

export default function AttendanceCheckCard({ sessionValid, sessionId, refreshKey = 0 }: AttendanceCheckCardProps) {
  const { toast } = useToast();
  const [data, setData] = useState<AttendanceItem[]>([]);
  const [lastFetched, setLastFetched] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAttendance = async () => {
    if (!sessionValid || !sessionId) return;

    setIsLoading(true);
    setError("");
    try {
      const res = await API.post("/srmapi/attendance/details", { sessionId });
      if (!res.data.success) throw new Error(res.data.message || "Failed to fetch attendance");
      setData(res.data.attendance?.data || []);
      setLastFetched(res.data.attendance?.last_fetched || new Date().toLocaleString());
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || "Something went wrong";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionValid) fetchAttendance();
    else {
      setData([]);
      setLastFetched("");
      setError("");
    }
    // fetchAttendance intentionally runs when a successful attendance submission increments refreshKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionValid, sessionId, refreshKey]);

  const isPresent = (status: string) => status.toUpperCase() === "P";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Check Attendance</CardTitle>
            <CardDescription>Today&apos;s attendance from the active SRM session.</CardDescription>
          </div>
          {sessionValid && (
            <div className="flex items-center gap-3">
              {lastFetched && <span className="text-xs text-muted-foreground">Updated: {lastFetched}</span>}
              <Button variant="outline" size="sm" onClick={fetchAttendance} disabled={isLoading}>
                <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!sessionValid && <SessionCard />}

        {error && sessionValid && (
          <div className="flex items-center gap-2 rounded-md border border-destructive p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {isLoading && <div className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}</div>}

        <AnimatePresence>
          {sessionValid && !isLoading && data.length > 0 && (
            <div className="space-y-3">
              {data.map((item, index) => (
                <motion.div
                  key={`${item.date}-${item.hour}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                >
                  <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.subject}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {item.date} &middot; {item.day}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{item.hour}</span>
                      <Badge variant="outline" className={cn("rounded-full px-3 py-1", isPresent(item.status) ? "border-green-300 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400" : "border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-700")}>
                        {isPresent(item.status) ? "Present" : "Absent"}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {sessionValid && !isLoading && data.length === 0 && !error && (
          <div className="space-y-2 py-4 text-center">
            <CalendarCheck className="mx-auto h-10 w-10 text-muted-foreground/60" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">No attendance records available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
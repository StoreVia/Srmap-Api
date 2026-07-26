"use client";
import { useToast } from "@/hooks/utils/useToast";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import API from "@/lib/api/axiosClient";
import { RefreshCw, CalendarCheck, AlertCircle, Clock, Calendar, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SessionCard from "@/components/utils/SessionCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/functions";
import { useSessionValidator } from "@/hooks/auth/useSessionValidator";

interface AttendanceItem {
  date: string;
  day: string;
  hour: string;
  subject: string;
  status: string;
}

const SkeletonCard = () => (
  <Card className="animate-pulse">
    <CardHeader className="pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg border bg-muted h-10 w-10" />
          <div className="space-y-2">
            <div className="h-4 w-36 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-5 w-16 bg-muted rounded-full" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      </div>
    </CardHeader>
  </Card>
);

const AttendanceCheck = () => {
  const { toast } = useToast();
  const { sessionValid, sessionId } = useSessionValidator();

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
      const msg = err?.response?.data?.message || err.message || "Something went wrong";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionValid) fetchAttendance();
  }, [sessionValid]);

  const isPresent = (status: string) => status.toUpperCase() === "P";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {lastFetched && (
          <p className="text-sm text-muted-foreground">Last fetched: {lastFetched}</p>
        )}
        {sessionValid && (
          <Button onClick={fetchAttendance} disabled={isLoading} className="flex items-center gap-2">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refetch
          </Button>
        )}
      </div>

      {!sessionValid && (
        <Card>
          <CardHeader>
            <CardTitle>Session Required</CardTitle>
            <CardDescription>Initiate a session to view attendance</CardDescription>
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
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {sessionValid && !isLoading && data.length > 0 && (
          <div className="space-y-4">
            {data.map((item, index) => (
              <motion.div
                key={`${item.date}-${item.hour}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.03 }}
              >
                <Card className="hover:shadow-lg transition">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold line-clamp-1">
                            {item.subject}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {item.date} &middot; {item.day}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {item.hour}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-semibold px-3 py-1 rounded-full",
                            isPresent(item.status)
                              ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                              : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700"
                          )}
                        >
                          {isPresent(item.status) ? "Present" : "Absent"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {sessionValid && !isLoading && data.length === 0 && !error && (
        <Card>
          <CardContent className="pt-6 pb-8 text-center space-y-3">
            <CalendarCheck className="h-10 w-10 mx-auto text-muted-foreground/60" strokeWidth={1.5} />
            <p className="text-muted-foreground text-sm">No attendance records available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceCheck;
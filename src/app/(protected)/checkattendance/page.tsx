"use client";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import API from "@/components/client/api/AxiosClient";
import { RefreshCw, CalendarCheck, AlertCircle, Clock, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SessionCard from "@/components/utils/SessionCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/fullStackUtils/utils/functions";
import { useSessionValidator } from "@/hooks/useSessionValidator";

interface AttendanceItem {
    date: string;
    day: string;
    hour: string;
    subject: string;
    status: string;
}

const AttendanceSkeletonCard = () => (
    <Card className="animate-pulse">
        <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:items-center">
                <div className="flex justify-between items-start sm:col-span-8">
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                    <div className="sm:hidden">
                        <div className="h-6 w-16 bg-muted rounded-full" />
                    </div>
                </div>
                <div className="flex items-center justify-between mt-2 sm:mt-0 sm:col-span-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-3 w-8 bg-muted rounded" />
                        <Clock className="h-3 w-3" />
                    </div>
                    <div className="hidden sm:block">
                        <div className="h-6 w-20 bg-muted rounded-full" />
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

const AttendanceCheck = () => {
    const { toast } = useToast();
    const { sessionValid, sessionId } = useSessionValidator();

    const [data, setData] = useState<AttendanceItem[]>([]);
    const [lastFetched, setLastFetched] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchAttendance = async () => {
        if (!sessionValid || !sessionId) return;
        setIsLoading(true);
        try {
            const res = await API.post("/srmapi/attendance/details", { sessionId });
            if (!res.data.success) throw new Error(res.data.message || "Failed to fetch attendance");
            setData(res.data.attendance?.data || []);
            setLastFetched(res.data.attendance?.last_fetched || new Date().toLocaleString());
        } catch (err: any) {
            const msg = err?.response?.data?.message || err.message || "Something went wrong";
            toast({ title: "Error", description: msg, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (sessionValid) fetchAttendance();
    }, [sessionValid]);

    const getStatusBadge = (status: string) => {
        const isPresent = status.toUpperCase() === "P";
        return (
            <Badge
                variant="outline"
                className={cn(
                    "text-xs font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full min-w-[70px] text-center",
                    isPresent
                        ? "bg-green-100 text-green-800 border-green-300"
                        : "bg-red-100 text-red-800 border-red-300"
                )}
            >
                {isPresent ? "Present" : "Absent"}
            </Badge>
        );
    };

    const formatDateForMobile = (date: string, day: string) => {
        return (
            <div className="flex items-center gap-1 sm:gap-2">
                <Calendar className="h-3.5 w-3.5 sm:hidden text-muted-foreground" />
                <div>
                    <div className="font-medium text-sm">{date}</div>
                    <div className="text-xs text-muted-foreground">{day.substring(0, 3)}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full -px-4 sm:px-0 space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 sm:px-0 w-full">
                {lastFetched && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Last fecthed: {lastFetched}
                    </p>
                )}
                {sessionValid && (
                    <Button
                        onClick={fetchAttendance}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
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

            {sessionValid && (
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3 sm:space-y-4"
                        >
                            {Array.from({ length: 4 }).map((_, i) => (
                                <AttendanceSkeletonCard key={i} />
                            ))}
                        </motion.div>
                    ) : data.length > 0 ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-3 sm:space-y-4"
                        >
                            {data.map((item, index) => (
                                <motion.div
                                    key={`${item.date}-${item.hour}-${index}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Card className="overflow-hidden hover:shadow-md transition-shadow mx-2 sm:mx-0">
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="sm:hidden flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    {formatDateForMobile(item.date, item.day)}
                                                    {getStatusBadge(item.status)}
                                                </div>
                                                <div className="font-medium text-sm">
                                                    {item.subject}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{item.hour}</span>
                                                </div>
                                            </div>

                                            <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center text-sm sm:text-base">
                                                <div className="col-span-3">
                                                    <div className="font-medium">{item.date}</div>
                                                    <div className="text-xs text-muted-foreground">{item.day}</div>
                                                </div>
                                                <div className="col-span-2 font-mono text-muted-foreground">
                                                    {item.hour}
                                                </div>
                                                <div className="col-span-5 font-medium line-clamp-1">
                                                    {item.subject}
                                                </div>
                                                <div className="col-span-2 flex justify-end">
                                                    {getStatusBadge(item.status)}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-8 sm:py-16 px-2 sm:px-0"
                        >
                            <Card className="bg-muted/40 border-dashed">
                                <CardContent className="pt-8 pb-10 sm:pt-10 sm:pb-12 text-center space-y-3">
                                    <CalendarCheck className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground/70" strokeWidth={1.5} />
                                    <h3 className="text-base sm:text-lg font-medium">No classes recorded today</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                                        Either there are no scheduled classes or attendance data is not yet available.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

export default AttendanceCheck;
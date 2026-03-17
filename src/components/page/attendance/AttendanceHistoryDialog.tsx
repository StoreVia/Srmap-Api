"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/useToast";
import { format, parse, isSameDay } from "date-fns";
import API from "@/components/client/api/AxiosClient";
import { Calendar, History, Lock, Unlock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AttendanceHistoryEntry {
    date: string;
    encrypted: boolean;
    data?: any;
}

interface AttendanceHistoryDialogProps {
    trigger?: React.ReactNode;
    onLoadToPage?: (data: any[]) => void;
}

export function AttendanceHistoryDialog({ trigger, onLoadToPage }: AttendanceHistoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [history, setHistory] = useState<AttendanceHistoryEntry[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [showPasswordInput, setShowPasswordInput] = useState<string | null>(null);

    useEffect(() => {
        if (open) fetchHistory();
    }, [open]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await API.get("/srmapi/attendance/history");
            const data = response.data;
            if (data.success) {
                setHistory(data.history || []);
            } else {
                toast.error("Failed to load attendance history");
            }
        } catch {
            toast.error("Error loading attendance history");
        } finally {
            setLoading(false);
        }
    };

    const refreshHistory = async () => {
        setRefreshing(true);
        try {
            const response = await API.get("/srmapi/attendance/history");
            const data = response.data;
            if (data.success) {
                toast.success("Attendance history refreshed");
                setHistory(data.history || []);
            }
        } finally {
            setRefreshing(false);
        }
    };

    const loadAttendanceForDate = async (date: string, retryWithPassword = false) => {
        setLoading(true);
        setSelectedDate(date);

        try {
            const body: any = { date };
            if (retryWithPassword && password) body.password = password;

            const response = await API.post("/srmapi/attendance/history", body);
            const data = response.data;

            if (data.success) {
                setHistory(prev =>
                    prev.map(item =>
                        item.date === date
                            ? { ...item, data: data.data, encrypted: false }
                            : item
                    )
                );
                setShowPasswordInput(null);
                setPassword("");
                toast.success(`Attendance loaded for ${date}`);
            } else {
                toast.error("Failed to load attendance data");
            }
        } catch (error: any) {
            const err = error?.response?.data;
            if (err?.code === "PASSWORD_REQUIRED" || err?.code === "INVALID_PASSWORD") {
                setShowPasswordInput(date);
                toast.error("Incorrect password. Enter the previous one.");
            } else {
                toast.error("Error loading attendance data");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLoadToPage = (data: any[]) => {
        onLoadToPage?.(data);
        toast.success("Attendance data loaded to page");
        setOpen(false);
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(parse(dateStr, "dd-MM-yyyy", new Date()), "MMM dd, yyyy");
        } catch {
            return dateStr;
        }
    };

    const isToday = (dateStr: string) => {
        try {
            return isSameDay(parse(dateStr, "dd-MM-yyyy", new Date()), new Date());
        } catch {
            return false;
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <History className="h-4 w-4" />
                        History
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="w-full max-w-2xl max-h-[80vh] overflow-y-auto px-4 sm:px-6 box-border">
                <DialogHeader>
                    <div className="flex justify-between items-center gap-2 min-w-0">
                        <DialogTitle className="flex items-center gap-2 min-w-0 flex-1">
                            <History className="h-5 w-5 shrink-0" />
                            <span className="truncate">Attendance History</span>
                        </DialogTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshHistory}
                            disabled={refreshing}
                            className="shrink-0"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-4 w-full min-w-0">
                    {history.map(entry => (
                        <Card key={entry.date} className="relative overflow-hidden w-full min-w-0">
                            {isToday(entry.date) && (
                                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                    Today
                                </div>
                            )}

                            <CardHeader>
                                <div className="flex justify-between items-center gap-2 min-w-0">
                                    <CardTitle className="text-base flex items-center gap-2 min-w-0 flex-1">
                                        <Calendar className="h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                            {formatDate(entry.date)}
                                        </span>
                                    </CardTitle>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {entry.encrypted ? (
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Unlock className="h-4 w-4 text-green-600" />
                                        )}

                                        {!entry.data && (
                                            <Button
                                                size="sm"
                                                onClick={() => loadAttendanceForDate(entry.date)}
                                                disabled={loading && selectedDate === entry.date}
                                            >
                                                Load
                                            </Button>
                                        )}

                                        {entry.data && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleLoadToPage(entry.data)}
                                            >
                                                Load To Page
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            {showPasswordInput === entry.date && (
                                <CardContent className="pt-0">
                                    <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                                        <Input
                                            type="password"
                                            placeholder="Enter previous password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                        <Button
                                            onClick={() =>
                                                loadAttendanceForDate(entry.date, true)
                                            }
                                            disabled={!password || loading}
                                            className="shrink-0"
                                        >
                                            Decrypt
                                        </Button>
                                    </div>
                                </CardContent>
                            )}

                            {entry.data && selectedDate === entry.date && (
                                <CardContent className="pt-3 space-y-3 min-w-0">
                                    {entry.data.map((s: any, i: number) => (
                                        <div
                                            key={i}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 min-w-0"
                                        >
                                            <div className="text-sm font-medium break-words whitespace-normal min-w-0 flex-1">
                                                {s.subject_name}
                                            </div>
                                            <div className="text-sm font-semibold shrink-0">
                                                {s.attendance_percentage || 0}%
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            )}
                        </Card>
                    ))}

                    <div className="pt-4 text-xs text-muted-foreground text-center">
                        Attendance history data is stored in encrypted form.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/utils/useToast";
import API from "@/lib/api/axiosClient";
import { Ban, Captions, RefreshCw, ShieldCheck } from "lucide-react";

interface CaptchaIp {
  ip: string;
  requests?: number;
  deniedRequests?: number;
  blocked?: boolean;
  blockedAt?: string;
  firstRequestedAt: string;
  lastRequestedAt: string;
}

interface CaptchaAdminData {
  enabled: boolean;
  requests: number;
  deniedRequests: number;
  uniqueIps: number;
  ips: CaptchaIp[];
}

export default function CaptchaAdminPage() {
  const [data, setData] = useState<CaptchaAdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [ipAction, setIpAction] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const response = await API.get("/admin/captcha");
      setData(response.data);
    } catch {
      toast({ title: "Could not load captcha activity", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") loadData();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const toggleService = async (enabled: boolean) => {
    setUpdating(true);
    try {
      await API.patch("/admin/captcha", { enabled });
      setData((current) => current ? { ...current, enabled } : current);
    } catch {
      toast({ title: "Could not update captcha setting", description: "Please try again.", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const toggleIp = async (ip: string, blocked: boolean) => {
    setIpAction(ip);
    try {
      await API.patch(`/admin/captcha/${encodeURIComponent(ip)}`, { blocked });
      setData((current) => current ? {
        ...current,
        ips: current.ips.map((record) => record.ip === ip ? { ...record, blocked } : record),
      } : current);
    } catch {
      toast({ title: "Could not update IP access", description: "Please try again.", variant: "destructive" });
    } finally {
      setIpAction(null);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-3 border-b bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Captions className="h-4 w-4" />
          Captcha API
        </CardTitle>
        <div className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 sm:min-w-52">
          <span className="text-sm font-medium">{data?.enabled ? "Service on" : "Service off"}</span>
          <Switch checked={data?.enabled ?? false} onCheckedChange={toggleService} disabled={loading || updating || !data} aria-label="Enable captcha solving" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total requests</p>
            <p className="mt-1 text-xl font-semibold">{loading ? "…" : (data?.requests ?? 0).toLocaleString()}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Unique IPs</p>
            <p className="mt-1 text-xl font-semibold">{loading ? "…" : (data?.uniqueIps ?? 0).toLocaleString()}</p>
          </div>
          <div className="col-span-2 rounded-lg border p-3 sm:col-span-1">
            <p className="text-xs text-muted-foreground">Denied requests</p>
            <p className="mt-1 text-xl font-semibold">{loading ? "…" : (data?.deniedRequests ?? 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">Requesting IP addresses</h3>
            <p className="text-xs text-muted-foreground">Showing the 200 most recently active IPs</p>
          </div>
          <Button size="sm" variant="outline" onClick={loadData} disabled={loading} aria-label="Refresh captcha activity">
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {loading && <p className="rounded-md border p-4 text-sm text-muted-foreground">Loading activity…</p>}
        {!loading && data?.ips.length === 0 && <p className="rounded-md border p-4 text-sm text-muted-foreground">No requests recorded yet.</p>}
        <ul className="max-h-[32rem] space-y-2 overflow-y-auto">
          {data?.ips.map((record) => (
            <li key={record.ip} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="break-all font-mono text-sm font-medium">{record.ip}</p>
                <p className="text-xs text-muted-foreground">
                  {(record.requests ?? 0).toLocaleString()} requests · {(record.deniedRequests ?? 0).toLocaleString()} denied · last seen {new Date(record.lastRequestedAt).toLocaleString()}
                </p>
                <p className={`flex items-center gap-1 text-xs ${record.blocked ? "text-destructive" : "text-muted-foreground"}`}>
                  {record.blocked ? <Ban className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  {record.blocked ? "Blocked" : "Allowed"}
                </p>
              </div>
              <Button
                size="sm"
                variant={record.blocked ? "outline" : "destructive"}
                className="w-full sm:w-auto"
                onClick={() => toggleIp(record.ip, !record.blocked)}
                disabled={ipAction !== null || record.ip === "unknown"}
              >
                {ipAction === record.ip ? "Saving…" : record.blocked ? "Unblock IP" : "Block IP"}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

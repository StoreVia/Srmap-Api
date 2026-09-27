"use client";
import { useState, useEffect, useCallback } from "react";
import API from "@/lib/api/axiosClient";
import { toast } from "@/hooks/utils/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Database,
    Trash2,
    RefreshCw,
    Search,
    AlertTriangle,
    ExternalLink,
    Copy,
    Check,
    Lock
} from "lucide-react";
import Link from "next/link";

interface BucketFile {
    key: string;
    size: number;
    lastModified: string;
}

interface AdminShareItem {
    shareId: string;
    creatorUsername: string;
    text?: string;
    files: Array<{
        fileId: string;
        name: string;
        size: number;
        type: string;
        s3Key: string;
    }>;
    totalBytes: number;
    isPublic: boolean;
    allowedRegNos: string[];
    isPasswordProtected: boolean;
    maxDownloads: number;
    remainingDownloads: number;
    expiresAt: string;
    createdAt: string;
    isExpired: boolean;
}

interface AdminShareStats {
    totalShares: number;
    totalBytes: number;
    totalFiles: number;
    activeShares: number;
    expiredShares: number;
}

const BUCKETS = [
    { id: "srmapi.1", label: "Database 1 (srmapi.1)" },
    { id: "srmapi.2", label: "Database 2 (srmapi.2)" },
    { id: "srmapi.3", label: "Database 3 (srmapi.3)" }
];

export default function SSAdminPage() {
    const [stats, setStats] = useState<AdminShareStats | null>(null);
    const [shares, setShares] = useState<AdminShareItem[]>([]);
    const [selectedBucket, setSelectedBucket] = useState<string>("srmapi.1");
    const [bucketFiles, setBucketFiles] = useState<BucketFile[]>([]);
    const [isLoadingBucket, setIsLoadingBucket] = useState(false);
    const [isLoadingShares, setIsLoadingShares] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"bucket" | "shares">("bucket");

    const [isPurgingAll, setIsPurgingAll] = useState(false);
    const [isPurgingExpired, setIsPurgingExpired] = useState(false);
    const [showPurgeAllModal, setShowPurgeAllModal] = useState(false);
    const [shareToDelete, setShareToDelete] = useState<string | null>(null);
    const [isDeletingShare, setIsDeletingShare] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchShares = useCallback(async () => {
        setIsLoadingShares(true);
        try {
            const res = await API.get("/admin/share");
            if (res.data?.success) {
                setStats(res.data.data.stats);
                setShares(res.data.data.shares || []);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to load shares");
        } finally {
            setIsLoadingShares(false);
        }
    }, []);

    const fetchBucketFiles = useCallback(async (bucketName: string) => {
        setIsLoadingBucket(true);
        try {
            const res = await API.get(`/admin/share?action=list-bucket&bucket=${bucketName}`);
            if (res.data?.success) {
                setBucketFiles(res.data.data.files || []);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || `Failed to list files in ${bucketName}`);
        } finally {
            setIsLoadingBucket(false);
        }
    }, []);

    const refreshAll = useCallback(() => {
        fetchShares();
        fetchBucketFiles(selectedBucket);
    }, [fetchShares, fetchBucketFiles, selectedBucket]);

    useEffect(() => {
        fetchShares();
    }, [fetchShares]);

    useEffect(() => {
        fetchBucketFiles(selectedBucket);
    }, [selectedBucket, fetchBucketFiles]);

    const handlePurgeAll = async () => {
        setIsPurgingAll(true);
        try {
            const res = await API.delete("/admin/share?action=purge-all");
            if (res.data?.success) {
                toast.success(res.data.message || "All 3 databases purged successfully");
                setShowPurgeAllModal(false);
                refreshAll();
            } else {
                toast.error(res.data?.message || "Purge all failed");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to purge databases");
        } finally {
            setIsPurgingAll(false);
        }
    };

    const handlePurgeExpired = async () => {
        setIsPurgingExpired(true);
        try {
            const res = await API.delete("/admin/share?action=purge-expired");
            if (res.data?.success) {
                toast.success(res.data.message || "Expired shares purged");
                refreshAll();
            } else {
                toast.error(res.data?.message || "Purge expired failed");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to purge expired");
        } finally {
            setIsPurgingExpired(false);
        }
    };

    const handleDeleteSingleShare = async () => {
        if (!shareToDelete) return;
        setIsDeletingShare(true);
        try {
            const res = await API.delete(`/admin/share?shareId=${shareToDelete}`);
            if (res.data?.success) {
                toast.success("Share purged");
                setShareToDelete(null);
                refreshAll();
            } else {
                toast.error(res.data?.message || "Delete failed");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Delete error");
        } finally {
            setIsDeletingShare(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const copyText = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Copied");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredBucketFiles = bucketFiles.filter((f) => {
        if (!searchQuery) return true;
        return f.key.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const filteredShares = shares.filter((s) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            s.shareId.toLowerCase().includes(q) ||
            s.creatorUsername.toLowerCase().includes(q) ||
            (s.text && s.text.toLowerCase().includes(q)) ||
            s.files.some((f) => f.name.toLowerCase().includes(q))
        );
    });

    return (
        <div className="w-full space-y-4 pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 text-xs font-semibold"
                        onClick={() => setShowPurgeAllModal(true)}
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Purge ALL Databases
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={handlePurgeExpired}
                        disabled={isPurgingExpired || (stats?.expiredShares || 0) === 0}
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Purge Expired ({stats?.expiredShares || 0})
                    </Button>
                    <Button
                        size="sm"
                        variant="default"
                        className="h-8 text-xs"
                        onClick={refreshAll}
                        disabled={isLoadingBucket || isLoadingShares}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoadingBucket || isLoadingShares ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {stats && (
                <Card className="border shadow-sm p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground font-medium">Total Storage</span>
                            <span className="text-xl font-bold font-mono text-primary mt-1">{formatBytes(stats.totalBytes)}</span>
                        </div>
                        <div className="flex flex-col sm:pl-4 pt-2 sm:pt-0">
                            <span className="text-xs text-muted-foreground font-medium">Shares</span>
                            <span className="text-xl font-bold font-mono mt-1">
                                {stats.totalShares} <span className="text-xs font-normal text-muted-foreground">({stats.activeShares} active · {stats.expiredShares} expired)</span>
                            </span>
                        </div>
                        <div className="flex flex-col sm:pl-4 pt-2 sm:pt-0">
                            <span className="text-xs text-muted-foreground font-medium">Replicated Files</span>
                            <span className="text-xl font-bold font-mono mt-1">{stats.totalFiles}</span>
                        </div>
                        <div className="flex flex-col sm:pl-4 pt-2 sm:pt-0">
                            <span className="text-xs text-muted-foreground font-medium">Databases</span>
                            <span className="text-sm font-semibold font-mono text-green-600 dark:text-green-400 mt-1">
                                3/3 Online (srmapi.1, .2, .3)
                            </span>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="border shadow-sm p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="w-56">
                            <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                                <SelectTrigger className="text-xs font-medium">
                                    <Database className="w-3.5 h-3.5 mr-1.5 text-university-700" />
                                    <SelectValue placeholder="Select Database" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BUCKETS.map((b) => (
                                         <SelectItem key={b.id} value={b.id} className="text-xs">
                                            {b.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
                            <TabsList className="h-8">
                                <TabsTrigger value="bucket" className="text-xs h-7">
                                    Bucket Files ({bucketFiles.length})
                                </TabsTrigger>
                                <TabsTrigger value="shares" className="text-xs h-7">
                                    Share Records ({shares.length})
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                        <Input
                            placeholder="Filter files or shares..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-8 text-xs"
                        />
                    </div>
                </div>

                {activeTab === "bucket" && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-2">
                            <span>
                                Files in <strong className="font-mono text-primary">{selectedBucket}</strong>: {filteredBucketFiles.length}
                            </span>
                            <span>{formatBytes(filteredBucketFiles.reduce((acc, f) => acc + f.size, 0))}</span>
                        </div>

                        {isLoadingBucket ? (
                            <div className="py-12 text-center text-xs text-muted-foreground">Loading bucket contents...</div>
                        ) : filteredBucketFiles.length === 0 ? (
                            <div className="py-12 text-center text-xs text-muted-foreground">
                                No files currently stored in {selectedBucket}.
                            </div>
                        ) : (
                            <div className="divide-y rounded border text-xs">
                                {filteredBucketFiles.map((file) => (
                                    <div
                                        key={file.key}
                                        className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="min-w-0 font-mono">
                                            <p className="font-semibold truncate text-primary">{file.key}</p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {formatBytes(file.size)} · {file.lastModified ? new Date(file.lastModified).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : ""}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-6 text-[11px] px-2"
                                                onClick={() => copyText(file.key, file.key)}
                                            >
                                                {copiedId === file.key ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                                Copy Key
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "shares" && (
                    <div className="space-y-2">
                        {isLoadingShares ? (
                            <div className="py-12 text-center text-xs text-muted-foreground">Loading share records...</div>
                        ) : filteredShares.length === 0 ? (
                            <div className="py-12 text-center text-xs text-muted-foreground">No shares found.</div>
                        ) : (
                            <div className="space-y-2">
                                {filteredShares.map((share) => (
                                    <div
                                        key={share.shareId}
                                        className={`p-3 rounded border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                            share.isExpired ? "opacity-60 bg-muted/10 border-dashed" : "hover:border-primary/40"
                                        }`}
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono font-bold text-primary">#{share.shareId}</span>
                                                <Badge variant="outline" className="text-[10px] font-mono">
                                                    {share.creatorUsername}
                                                </Badge>
                                                <Badge variant={share.isPublic ? "secondary" : "default"} className="text-[10px]">
                                                    {share.isPublic ? "Public" : "Private"}
                                                </Badge>
                                                {share.isPasswordProtected && (
                                                    <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/40">
                                                        <Lock className="w-2.5 h-2.5 mr-0.5" /> Password
                                                    </Badge>
                                                )}
                                                <Badge variant={share.isExpired ? "destructive" : "outline"} className="text-[10px]">
                                                    {share.isExpired ? "Expired" : "Active"}
                                                </Badge>
                                            </div>

                                            <div className="text-muted-foreground text-[11px] font-mono">
                                                Files: {share.files.length} ({formatBytes(share.totalBytes)}) · Downloads: {share.remainingDownloads}/{share.maxDownloads}
                                                {share.text ? ` · Text: ${share.text.slice(0, 40)}...` : ""}
                                            </div>
                                            <div className="text-muted-foreground text-[11px] font-mono">
                                                Created: {new Date(share.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                                                {" · "}
                                                Expires: {new Date(share.expiresAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                                            <Button asChild size="sm" variant="outline" className="h-6 text-[11px] px-2">
                                                <Link href={`/share/${share.shareId}`} target="_blank">
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    Open
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="h-6 text-[11px] px-2"
                                                onClick={() => setShareToDelete(share.shareId)}
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" />
                                                Purge
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Card>

            <Dialog open={showPurgeAllModal} onOpenChange={setShowPurgeAllModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Purge ALL 3 Databases
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2 text-xs text-muted-foreground">
                        This will permanently delete all files from <strong>srmapi.1</strong>, <strong>srmapi.2</strong>, and <strong>srmapi.3</strong>, and wipe all share metadata records from the database.
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowPurgeAllModal(false)} disabled={isPurgingAll}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handlePurgeAll} disabled={isPurgingAll}>
                            {isPurgingAll ? "Purging Everything..." : "Yes, Purge ALL Databases"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!shareToDelete} onOpenChange={() => setShareToDelete(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            Purge Share #{shareToDelete}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2 text-xs text-muted-foreground">
                        Delete this share and all attached files from all 3 S3 buckets.
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShareToDelete(null)} disabled={isDeletingShare}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDeleteSingleShare} disabled={isDeletingShare}>
                            {isDeletingShare ? "Purging..." : "Purge Share"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

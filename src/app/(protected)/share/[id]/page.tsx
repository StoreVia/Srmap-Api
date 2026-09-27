"use client";
import { useState, useEffect, use, useCallback } from "react";
import API from "@/lib/api/axiosClient";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/utils/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Turnstile } from "@/components/utils/Turnstile";
import {
    Share2,
    Lock,
    Clock,
    Download,
    Copy,
    Check,
    FileText,
    ShieldAlert,
    LogIn,
    HardDrive,
    ShieldCheck,
    ArrowLeft,
    Users
} from "lucide-react";
import { ShareDetailResponse } from "@/types/share";
import Link from "next/link";

export default function ShareDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: shareId } = use(params);
    const { isAuthenticated, activeAccountId, accounts } = useAuth();
    const currentUsername = accounts.find((a) => a.id === activeAccountId)?.username || "";

    const [shareData, setShareData] = useState<ShareDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isForbidden, setIsForbidden] = useState(false);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [isUnlocking, setIsUnlocking] = useState(false);

    const [selectedFileForDownload, setSelectedFileForDownload] = useState<{ fileId: string; name: string } | null>(null);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [directDownloadUrl, setDirectDownloadUrl] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [editIsPublic, setEditIsPublic] = useState(true);
    const [editRegNos, setEditRegNos] = useState("");
    const [isSavingAccess, setIsSavingAccess] = useState(false);

    const fetchShare = useCallback(async (pwd?: string) => {
        setIsLoading(true);
        setErrorMessage(null);
        setIsForbidden(false);

        try {
            const url = pwd ? `/share/${shareId}?password=${encodeURIComponent(pwd)}` : `/share/${shareId}`;
            const res = await API.get(url);

            if (res.data?.success) {
                setShareData(res.data.data);
                if (res.data.data.isPasswordProtected && !res.data.data.isUnlocked) {
                    setIsPasswordModalOpen(true);
                } else {
                    setIsPasswordModalOpen(false);
                }
            } else {
                setErrorMessage(res.data?.message || "Share not found or expired");
            }
        } catch (err: any) {
            if (err.response?.status === 403) {
                setIsForbidden(true);
                setErrorMessage(err.response?.data?.message || "You do not have access to this private share");
            } else if (err.response?.status === 401) {
                setIsPasswordModalOpen(true);
                if (pwd) toast({ title: "Error", description: "Incorrect password for this share", variant: "destructive" });
            } else {
                setErrorMessage(err.response?.data?.message || "Share has expired or does not exist");
            }
        } finally {
            setIsLoading(false);
        }
    }, [shareId, toast]);

    useEffect(() => {
        fetchShare();
    }, [fetchShare]);

    const handleUnlockWithPassword = async () => {
        if (!passwordInput.trim()) {
            toast({ title: "Error", description: "Please enter a password", variant: "destructive" });
            return;
        }

        setIsUnlocking(true);
        try {
            await fetchShare(passwordInput.trim());
        } finally {
            setIsUnlocking(false);
        }
    };

    const openAccessModal = () => {
        if (!shareData) return;
        setEditIsPublic(shareData.isPublic);
        setIsAccessModalOpen(true);
    };

    const handleSaveAccess = async () => {
        setIsSavingAccess(true);
        try {
            const parsedRegNos = editRegNos
                .split(/[\s,]+/)
                .map((r) => r.trim().toUpperCase())
                .filter((r) => r.length > 0);

            const res = await API.patch(`/share/${shareId}`, {
                isPublic: editIsPublic,
                allowedRegNos: parsedRegNos
            });

            if (res.data?.success) {
                toast({ title: "Success", description: "Access permissions updated successfully" });
                setIsAccessModalOpen(false);
                fetchShare(passwordInput.trim() || undefined);
            } else {
                toast({ title: "Error", description: res.data?.message || "Failed to update access", variant: "destructive" });
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.response?.data?.message || "Failed to update access", variant: "destructive" });
        } finally {
            setIsSavingAccess(false);
        }
    };

    const handleInitiateDownload = (file: { fileId: string; name: string }) => {
        if (!isAuthenticated) {
            setIsLoginPromptOpen(true);
            return;
        }

        setSelectedFileForDownload(file);
        setTurnstileToken(null);
        setDirectDownloadUrl(null);
        setIsDownloadModalOpen(true);
    };

    const triggerBrowserDownload = (url: string, filename: string) => {
        try {
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                try {
                    document.body.removeChild(link);
                } catch {}
            }, 1000);
        } catch {
            window.location.href = url;
        }
    };

    const handleExecuteDirectDownload = async () => {
        if (!selectedFileForDownload) return;
        if (!turnstileToken) {
            toast({ title: "Error", description: "Please complete the Cloudflare verification challenge", variant: "destructive" });
            return;
        }

        setIsDownloading(true);
        try {
            const res = await API.post(`/share/${shareId}/download`, {
                fileId: selectedFileForDownload.fileId,
                turnstileToken,
                password: passwordInput.trim() || undefined
            });

            if (res.data?.success && res.data.data?.downloadUrl) {
                const { downloadUrl, filename, remainingDownloads } = res.data.data;
                setDirectDownloadUrl(downloadUrl);

                triggerBrowserDownload(downloadUrl, filename);

                toast({ title: "Success", description: `Download started (${remainingDownloads} downloads left)` });
                fetchShare(passwordInput.trim() || undefined);
                setTimeout(() => {
                    setIsDownloadModalOpen(false);
                    setDirectDownloadUrl(null);
                }, 2500);
            } else {
                toast({ title: "Error", description: res.data?.message || "Download failed", variant: "destructive" });
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.response?.data?.message || err.message || "Failed to download file", variant: "destructive" });
        } finally {
            setIsDownloading(false);
        }
    };

    const copyTextContent = () => {
        if (!shareData?.text) return;
        navigator.clipboard.writeText(shareData.text);
        setIsCopied(true);
        toast({ title: "Copied", description: "Text copied to clipboard" });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const formatRemainingTime = (isoString: string) => {
        const diff = new Date(isoString).getTime() - Date.now();
        if (diff <= 0) return "Expired";
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const remMins = minutes % 60;
        if (hours > 0) return `${hours}h ${remMins}m left`;
        return `${remMins}m left`;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-university-700" />
                <p className="text-sm text-muted-foreground font-mono">Verifying and retrieving Secure Share...</p>
            </div>
        );
    }

    if (isForbidden && !isPasswordModalOpen) {
        return (
            <div className="max-w-lg mx-auto py-12 px-4">
                <Card className="border-destructive/30 shadow-lg text-center p-6">
                    <ShieldAlert className="w-12 h-12 mx-auto text-destructive mb-3" />
                    <CardTitle className="text-xl">Access Denied</CardTitle>
                    <CardDescription className="mt-2 text-sm">
                        This is a private share restricted to designated registration numbers.
                    </CardDescription>
                    <div className="mt-6 flex flex-col gap-2">
                        {!isAuthenticated ? (
                            <Button asChild variant="default">
                                <Link href={`/login?redirect=/share/${shareId}`}>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Log In with SRM Account
                                </Link>
                            </Button>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Logged in as <span className="font-mono font-bold text-primary">{currentUsername}</span> (Not authorized for this share)
                            </p>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    if (errorMessage && !shareData && !isPasswordModalOpen) {
        return (
            <div className="max-w-lg mx-auto py-12 px-4">
                <Card className="border shadow-lg text-center p-6">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <CardTitle className="text-xl">Share Unavailable</CardTitle>
                    <CardDescription className="mt-2 text-sm">{errorMessage}</CardDescription>
                    <div className="mt-6">
                        <Button asChild variant="outline">
                            <Link href="/share">
                                <ArrowLeft className="w-4 h-4 mr-1.5" />
                                Back to Secure Share
                            </Link>
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className={`w-full space-y-6 ${!isAuthenticated ? "p-3 sm:p-6 min-h-screen bg-background" : ""}`}>
            {!isAuthenticated && (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/40 text-xs">
                    <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-university-700" />
                        <span>You are viewing a public Secure Share.</span>
                    </div>
                    <Button asChild size="sm" variant="default" className="h-7 text-xs">
                        <Link href={`/login?redirect=/share/${shareId}`}>
                            <LogIn className="w-3.5 h-3.5 mr-1" />
                            Log In
                        </Link>
                    </Button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center gap-3">
                    {isAuthenticated && (
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href="/share">
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Button>
                    )}
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                            <Share2 className="w-6 h-6 text-university-700" />
                            Secure Share #{shareId}
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Shared by <span className="font-mono font-semibold text-primary">{shareData?.creatorUsername || "Anonymous"}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {shareData?.isOwner && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={openAccessModal}>
                            <Users className="w-3.5 h-3.5 mr-1 text-university-700" />
                            Manage Access
                        </Button>
                    )}
                    <Badge variant={shareData?.isPublic ? "secondary" : "default"} className="text-xs">
                        {shareData?.isPublic ? "Public Share" : "Private Share"}
                    </Badge>
                    {shareData?.isPasswordProtected && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
                            <Lock className="w-3 h-3" /> Protected
                        </Badge>
                    )}
                    {shareData?.expiresAt && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatRemainingTime(shareData.expiresAt)}
                        </Badge>
                    )}
                </div>
            </div>

            {shareData?.isPasswordProtected && !shareData.isUnlocked && (
                <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm p-6 text-center space-y-4">
                    <Lock className="w-10 h-10 mx-auto text-amber-500" />
                    <div>
                        <h3 className="font-bold text-base">This Share is Password Protected</h3>
                        <p className="text-xs text-muted-foreground mt-1">Enter the password provided by the creator to view the text and files.</p>
                    </div>
                    <Button onClick={() => setIsPasswordModalOpen(true)}>Enter Password</Button>
                </Card>
            )}

            {shareData?.isUnlocked && (
                <>
                    {shareData.text && shareData.text.trim().length > 0 && (
                        <Card className="border shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-university-700" />
                                    Shared Text Content
                                </CardTitle>
                                <Button size="sm" variant="outline" onClick={copyTextContent} className="h-8 text-xs">
                                    {isCopied ? <Check className="w-3.5 h-3.5 mr-1 text-green-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                    {isCopied ? "Copied" : "Copy Text"}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 rounded-lg bg-muted/40 font-mono text-sm whitespace-pre-wrap break-words border selection:bg-university-700 selection:text-white">
                                    {shareData.text}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {shareData.files && shareData.files.length > 0 && (
                        <Card className="border shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <HardDrive className="w-4 h-4 text-university-700" />
                                        Attached Files ({shareData.files.length})
                                    </CardTitle>
                                    <span className="text-xs font-semibold text-primary">
                                        {shareData.remainingDownloads} / {shareData.maxDownloads} downloads left
                                    </span>
                                </div>
                                <CardDescription className="text-xs">
                                    File downloads require Student login.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {shareData.remainingDownloads <= 0 ? (
                                    <div className="p-4 rounded-lg border border-dashed text-center text-xs text-muted-foreground">
                                        Download limit for these files has been exhausted.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {shareData.files.map((file) => (
                                            <div key={file.fileId} className="p-3.5 rounded-lg border bg-muted/20 flex flex-col justify-between gap-3">
                                                <div className="flex items-start gap-2.5 min-w-0">
                                                    <FileText className="w-5 h-5 flex-shrink-0 text-university-700 mt-0.5" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium text-xs truncate" title={file.name}>
                                                            {file.name}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                                            {formatBytes(file.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="default"
                                                    className="w-full text-xs h-8 cursor-pointer"
                                                    onClick={() => handleInitiateDownload(file)}
                                                >
                                                    <Download className="w-3.5 h-3.5 mr-1.5" />
                                                    Download File
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            <Dialog open={isLoginPromptOpen} onOpenChange={setIsLoginPromptOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <LogIn className="w-5 h-5 text-university-700" />
                            Login Required
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Downloading files requires logging in with your SRM account. Text content is free to view without logging in.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col gap-2 pt-2">
                        <Button asChild variant="default" className="w-full">
                            <Link href={`/login?redirect=/share/${shareId}`}>
                                Log In to Download
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => setIsLoginPromptOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-amber-500" />
                            Password Required
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            This share is password protected. Enter the password to unlock.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <Input
                            type="password"
                            placeholder="Enter password..."
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleUnlockWithPassword();
                            }}
                            className="text-sm"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="default" className="w-full" onClick={handleUnlockWithPassword} disabled={isUnlocking}>
                            {isUnlocking ? "Unlocking..." : "Unlock Share"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-sm">
                            <ShieldCheck className="w-5 h-5 text-university-700" />
                            Security Verification for Download
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Please complete the Turnstile verification below to download your file.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3 flex flex-col items-center justify-center">
                        <div className="text-xs font-mono p-2 rounded bg-muted/40 w-full text-center truncate">
                            File: {selectedFileForDownload?.name}
                        </div>

                        {!directDownloadUrl && (
                            <Turnstile
                                onVerify={(token) => setTurnstileToken(token)}
                                onExpire={() => setTurnstileToken(null)}
                                onError={() => setTurnstileToken(null)}
                                className="flex justify-center my-2"
                            />
                        )}

                        {directDownloadUrl && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center space-y-1 w-full animate-in fade-in">
                                <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                                    ✓ Download started directly from storage
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    One-time secure link dispatched. Window will close automatically.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsDownloadModalOpen(false)}>
                            {directDownloadUrl ? "Close" : "Cancel"}
                        </Button>
                        {!directDownloadUrl && (
                            <Button
                                type="button"
                                variant="default"
                                className="w-full sm:w-auto"
                                disabled={!turnstileToken || isDownloading}
                                onClick={handleExecuteDirectDownload}
                            >
                                {isDownloading ? "Starting Direct Download..." : "Start Direct Download"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAccessModalOpen} onOpenChange={setIsAccessModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <Users className="w-5 h-5 text-university-700" />
                            Manage Share Access
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Edit recipient permissions or change privacy mode for this share.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 text-sm">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                            <div>
                                <p className="font-medium text-xs">Privacy Mode</p>
                                <p className="text-[11px] text-muted-foreground">
                                    {editIsPublic ? "Public: Anyone with the link can view text" : "Private: Restricted to specific registration numbers"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{editIsPublic ? "Public" : "Private"}</span>
                                <Switch checked={!editIsPublic} onCheckedChange={(checked) => setEditIsPublic(!checked)} />
                            </div>
                        </div>

                        {!editIsPublic && (
                            <div className="space-y-1.5 animate-in fade-in">
                                <label className="text-xs font-semibold">Allowed Registration Number(s)</label>
                                <Textarea
                                    rows={3}
                                    placeholder="e.g. AP24110010198, AP241100101130"
                                    value={editRegNos}
                                    onChange={(e) => setEditRegNos(e.target.value)}
                                    className="font-mono text-xs"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Separate registration numbers with commas or spaces. Leave empty to allow only yourself.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsAccessModalOpen(false)} disabled={isSavingAccess}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveAccess} disabled={isSavingAccess}>
                            {isSavingAccess ? "Saving..." : "Save Access"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
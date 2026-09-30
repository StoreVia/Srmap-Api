"use client";
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/utils/useToast";
import { Upload, Copy, Check, File as FileIcon, Info, AlertTriangle, ExternalLink, MoreVertical, Trash2, Users, Globe, FileText, UserPlus, X } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import API from "@/lib/api/axiosClient";
import Link from "next/link";
import { ShareListItem } from "@/types/share";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const SecureShare = () => {
    const { toast } = useToast();
    const [files, setFiles] = useState<File[]>([]);
    const [textPaste, setTextPaste] = useState("");
    const [uploading, setUploading] = useState(false);
    const [link, setLink] = useState("");
    const [copied, setCopied] = useState<string | null>(null);
    const [maxDownloads, setMaxDownloads] = useState<number>(5);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [shareType, setShareType] = useState<"public" | "friend">("public");
    const [friendRegNos, setFriendRegNos] = useState<string[]>([""]);
    const [unregisteredWarning, setUnregisteredWarning] = useState<string[] | null>(null);

    const [selectedShareForEdit, setSelectedShareForEdit] = useState<ShareListItem | null>(null);
    const [editShareType, setEditShareType] = useState<"public" | "friend">("public");
    const [editFriendRegNos, setEditFriendRegNos] = useState<string[]>([""]);
    const [isSavingAccess, setIsSavingAccess] = useState(false);

    const [myUploads, setMyUploads] = useState<any[]>([]);
    const [loadingUploads, setLoadingUploads] = useState(true);

    const [receivedUploads, setReceivedUploads] = useState<any[]>([]);
    const [loadingReceived, setLoadingReceived] = useState(true);

    const [storageStats, setStorageStats] = useState<{ usedBytes: number; maxBytes: number; remainingBytes: number } | null>(null);

    const hasInitialLoadedRef = useRef(false);

    const totalFilesSize = useMemo(() => files.reduce((acc, f) => acc + f.size, 0), [files]);
    const totalFilesSizeLabel = useMemo(() => {
        if (files.length === 0) return null;
        const mb = totalFilesSize / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    }, [files, totalFilesSize]);

    const processUploadsForUI = (items: ShareListItem[]) => {
        return items.map((item) => {
            const shareLink = `${window.location.origin}/share/${item.shareId}`;
            const displayName = item.hasText && item.filesCount === 0 
                ? (item.textSnippet || "Secure Text Paste") 
                : (item.filesCount > 0 ? `Shared File (${item.filesCount} attached)` : "Secure Item");
            return {
                ...item,
                displayName,
                shareLink
            };
        });
    };

    const fetchData = useCallback(async () => {
        if (!hasInitialLoadedRef.current) {
            setLoadingUploads(true);
            setLoadingReceived(true);
        }
        try {
            const listRes = await API.get("/share/list");
            if (listRes.data?.success) {
                const myProcessed = processUploadsForUI(listRes.data.data?.myShares || []);
                const recProcessed = processUploadsForUI(listRes.data.data?.sharedWithMe || []);
                setMyUploads(myProcessed);
                setReceivedUploads(recProcessed);

                if (listRes.data.data?.storage) {
                    setStorageStats(listRes.data.data.storage);
                }

                const lastSeenCount = localStorage.getItem("share_received_count") || "0";
                if (recProcessed.length > parseInt(lastSeenCount, 10)) {
                    toast({
                        title: "New File Received",
                        description: "Someone shared a file with you! Check the Received tab."
                    });
                }
                localStorage.setItem("share_received_count", recProcessed.length.toString());
            }
        } catch (error) {
            if (!hasInitialLoadedRef.current) {
                toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
            }
        } finally {
            hasInitialLoadedRef.current = true;
            setLoadingUploads(false);
            setLoadingReceived(false);
        }
    }, [toast]);

    useEffect(() => {
        let isMounted = true;
        let timerId: NodeJS.Timeout | null = null;

        const runFetchLoop = async () => {
            if (!isMounted) return;
            try {
                await fetchData();
            } catch {}
            if (isMounted) {
                timerId = setTimeout(runFetchLoop, 10000);
            }
        };

        runFetchLoop();

        return () => {
            isMounted = false;
            if (timerId) clearTimeout(timerId);
        };
    }, [fetchData]);

    const deleteUpload = async (shareId: string) => {
        setMyUploads(prev => prev.filter(u => u.shareId !== shareId));
        try {
            const res = await API.delete(`/share/${shareId}`);
            if (res.data?.success) {
                toast({ title: "Success", description: "File deleted successfully" });
                fetchData();
            } else {
                fetchData();
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to delete file", variant: "destructive" });
            fetchData();
        }
    };

    const openEditAccessDialog = (share: ShareListItem) => {
        setSelectedShareForEdit(share);
        setEditShareType(share.isPublic ? "public" : "friend");
        const existingRegs = (share.allowedRegNos && share.allowedRegNos.length > 0) ? [...share.allowedRegNos] : [""];
        setEditFriendRegNos(existingRegs);
    };

    const saveEditedAccess = async () => {
        if (!selectedShareForEdit) return;

        if (editShareType === "friend") {
            const validRegNos = editFriendRegNos.map((r) => r.trim()).filter((r) => r.length > 0);
            if (validRegNos.length === 0) {
                toast({ title: "Error", description: "Please enter at least one valid registration number", variant: "destructive" });
                return;
            }
        }

        setIsSavingAccess(true);
        try {
            const validRegNos = editFriendRegNos.map((r) => r.trim().toUpperCase()).filter((r) => r.length > 0);
            const res = await API.patch(`/share/${selectedShareForEdit.shareId}`, {
                isPublic: editShareType === "public",
                allowedRegNos: validRegNos
            });

            if (res.data?.success) {
                toast({ title: "Success", description: "Access permissions updated successfully" });
                setSelectedShareForEdit(null);
                fetchData();
            } else {
                toast({ title: "Error", description: res.data?.message || "Failed to update access", variant: "destructive" });
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || error.response?.data?.error || "Failed to update access";
            toast({ title: "Error", description: msg, variant: "destructive" });
        } finally {
            setIsSavingAccess(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files;
        if (!selected || selected.length === 0) return;
        const newFiles = Array.from(selected);
        setFiles(prev => {
            const combined = [...prev, ...newFiles];
            const totalSize = combined.reduce((acc, f) => acc + f.size, 0);
            if (totalSize > MAX_UPLOAD_BYTES) {
                toast({ title: "Size limit exceeded", description: `Total files cannot exceed 20 MB. Current selection: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`, variant: "destructive" });
                return prev;
            }
            return combined;
        });
        setLink("");
        event.target.value = "";
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const openConfigDialog = () => {
        if (!textPaste.trim() && files.length === 0) {
            toast({ title: "Error", description: "Please enter text or attach a file", variant: "destructive" });
            return;
        }
        if (totalFilesSize > MAX_UPLOAD_BYTES) {
            toast({ title: "Size limit exceeded", description: "Total files cannot exceed 20 MB.", variant: "destructive" });
            return;
        }
        if (storageStats && (storageStats.remainingBytes < totalFilesSize)) {
            toast({ title: "Storage quota full", description: `You only have ${(storageStats.remainingBytes / (1024 * 1024)).toFixed(2)} MB remaining.`, variant: "destructive" });
            return;
        }
        setIsDialogOpen(true);
    };

    const createSecureLink = async () => {
        if (shareType === "friend") {
            const validRegNos = friendRegNos.map((r) => r.trim()).filter((r) => r.length > 0);
            if (validRegNos.length === 0) {
                toast({ title: "Error", description: "Please enter at least one valid registration number", variant: "destructive" });
                return;
            }
            if (validRegNos.length > maxDownloads) {
                toast({
                    title: "Error",
                    description: `You selected a maximum of ${maxDownloads} downloads, so you can only share with up to ${maxDownloads} friends.`,
                    variant: "destructive"
                });
                return;
            }
        }

        setIsDialogOpen(false);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("isPublic", String(shareType === "public"));
            formData.append("maxDownloads", String(maxDownloads));

            if (password.trim()) {
                formData.append("password", password.trim());
            }

            if (shareType === "friend") {
                const validRegNos = friendRegNos.map((r) => r.trim().toUpperCase()).filter((r) => r.length > 0);
                formData.append("allowedRegNos", validRegNos.join(","));
            }

            if (textPaste.trim()) {
                formData.append("text", textPaste.trim());
            }
            if (files.length > 0) {
                files.forEach(f => formData.append("files", f));
            }

            const response = await API.post("/share/create", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.data?.success) {
                const shareId = response.data.data.shareId;
                const finalLink = `${window.location.origin}/share/${shareId}`;
                setLink(finalLink);
                setFiles([]);
                setTextPaste("");
                setPassword("");
                setShareType("public");
                setFriendRegNos([""]);

                if (response.data.data?.unregisteredUsers && response.data.data.unregisteredUsers.length > 0) {
                    setUnregisteredWarning(response.data.data.unregisteredUsers);
                } else {
                    toast({ title: "Success", description: "Secure link generated successfully!" });
                }

                fetchData();
            } else {
                toast({ title: "Error", description: response.data?.message || "Upload failed", variant: "destructive" });
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || "Upload failed";
            toast({ title: "Error", description: msg, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 1600);
    };

    return (
        <div className="grid gap-6">
            <Tabs defaultValue="uploads" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="uploads">Your Uploads</TabsTrigger>
                    <TabsTrigger value="received">Received Files</TabsTrigger>
                </TabsList>
                
                <TabsContent value="uploads" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Secure File Transfer</CardTitle>
                            {storageStats && (() => {
                                const usedMB = (storageStats.usedBytes / (1024 * 1024));
                                const maxMB = (storageStats.maxBytes / (1024 * 1024));
                                const pct = Math.min((storageStats.usedBytes / storageStats.maxBytes) * 100, 100);
                                const r = 14;
                                const circ = 2 * Math.PI * r;
                                const filled = (pct / 100) * circ;
                                const strokeColor = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#22c55e";
                                return (
                                    <div className="flex items-center gap-2" title={`${usedMB.toFixed(1)} MB used of ${maxMB.toFixed(0)} MB`}>
                                        <div className="relative h-9 w-9">
                                            <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                                                <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                                                <circle cx="18" cy="18" r={r} fill="none" stroke={strokeColor} strokeWidth="3"
                                                    strokeDasharray={`${filled} ${circ - filled}`}
                                                    strokeLinecap="round"
                                                    style={{ transition: "stroke-dasharray 0.5s ease" }}
                                                />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">
                                                {Math.round(pct)}%
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-foreground leading-tight">{usedMB.toFixed(1)} / {maxMB.toFixed(0)} MB</span>
                                            <span className="text-[10px] text-muted-foreground leading-tight">Storage used</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label>Paste Your Text</Label>
                                <textarea
                                    className="w-full h-28 p-3 text-sm bg-muted/40 border rounded-lg focus:outline-none focus:ring-2 focus:ring-university-500 resize-none transition-colors"
                                    placeholder="Paste your text here... (optional if file attached)"
                                    value={textPaste}
                                    onChange={(e) => { setTextPaste(e.target.value); setLink(""); }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Attach Files</Label>
                                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted/80 transition-colors">
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground">Multiple files allowed</p>
                                    </div>
                                    <input type="file" className="hidden" multiple onChange={handleFileChange} />
                                </label>
                                {files.length > 0 && (
                                    <div className="space-y-1.5">
                                        {files.map((f, idx) => (
                                            <div key={`${f.name}-${idx}`} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <FileIcon className="h-4 w-4 text-university-500 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">{f.name}</p>
                                                        <p className="text-xs text-muted-foreground">{(f.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => removeFile(idx)}>
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between px-1 pt-1">
                                            <p className="text-xs text-muted-foreground">{files.length} file{files.length !== 1 ? 's' : ''} selected</p>
                                            <p className={`text-xs font-medium ${totalFilesSize > MAX_UPLOAD_BYTES ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                {totalFilesSizeLabel} / 20 MB
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Maximum Downloads</Label>
                                <div className="flex flex-wrap gap-4">
                                    {[1, 5, 10].map((num) => (
                                        <div key={num} className="flex items-center space-x-3">
                                            <label className="custom-container">
                                                <input
                                                    type="radio"
                                                    name="maxDownloads"
                                                    value={num}
                                                    checked={maxDownloads === num}
                                                    onChange={() => setMaxDownloads(num)}
                                                />
                                                <div className="checkmark"></div>
                                            </label>
                                            <Label className="text-sm font-medium cursor-pointer select-none" onClick={() => setMaxDownloads(num)}>
                                                {num} {num === 1 ? "Download" : "Downloads"}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <Button
                                    onClick={openConfigDialog}
                                    disabled={uploading || (files.length === 0 && !textPaste.trim()) || totalFilesSize > MAX_UPLOAD_BYTES}
                                    className="w-full bg-university-700 hover:bg-university-800 text-white"
                                >
                                    {uploading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Uploading...
                                        </span>
                                    ) : (
                                        "Create Secure Link"
                                    )}
                                </Button>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Configure Link</DialogTitle>
                                        <DialogDescription>Customize security and sharing options.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        <div className="space-y-3">
                                            <Label>Sharing Option</Label>
                                            <div className="flex gap-4">
                                                <div 
                                                    className={`flex-1 p-3 border rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${shareType === "public" ? "bg-university-50 border-university-200 dark:bg-university-900/30 dark:border-university-800" : "hover:bg-muted/50"}`}
                                                    onClick={() => setShareType("public")}
                                                >
                                                    <Globe className="h-5 w-5 text-university-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">Public</p>
                                                        <p className="text-xs text-muted-foreground">Anyone with the link; file downloads require sign-in</p>
                                                    </div>
                                                </div>
                                                <div 
                                                    className={`flex-1 p-3 border rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${shareType === "friend" ? "bg-university-50 border-university-200 dark:bg-university-900/30 dark:border-university-800" : "hover:bg-muted/50"}`}
                                                    onClick={() => setShareType("friend")}
                                                >
                                                    <Users className="h-5 w-5 text-university-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">Friend</p>
                                                        <p className="text-xs text-muted-foreground">Specified registered users</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {shareType === "friend" && (
                                            <div className="space-y-3">
                                                <Label>Friend's Registration Numbers</Label>
                                                {friendRegNos.map((regNo, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <Input
                                                            placeholder="e.g. AP2411..."
                                                            value={regNo}
                                                            onChange={(e) => {
                                                                const newRegNos = [...friendRegNos];
                                                                newRegNos[idx] = e.target.value;
                                                                setFriendRegNos(newRegNos);
                                                            }}
                                                        />
                                                        {friendRegNos.length > 1 && (
                                                            <Button variant="ghost" className="px-2 shrink-0" onClick={() => setFriendRegNos(friendRegNos.filter((_, i) => i !== idx))}>
                                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                                {friendRegNos.length < 10 && (
                                                    <Button variant="outline" size="sm" onClick={() => setFriendRegNos([...friendRegNos, ""])} className="w-full">
                                                        + Add user
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <Label>Password</Label>
                                            <Input
                                                type="password"
                                                placeholder="Leave blank for no password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                If provided, recipients will need this password to access the share.
                                            </p>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={createSecureLink} className="bg-university-700 hover:bg-university-800 text-white">
                                            Confirm & Generate Link
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {link && (
                                <div className="mt-4 p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                                    <Label className="text-green-800 dark:text-green-300">YOUR ONE-TIME LINK</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex-1 p-2 text-sm bg-white dark:bg-black border rounded truncate select-all">
                                            {link}
                                        </div>
                                        <Button onClick={() => copyToClipboard(link, "main")} variant="outline" className="shrink-0 gap-2">
                                            {copied === "main" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                            {copied === "main" ? "Copied" : "Copy"}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        <Info className="h-3 w-3" /> File access ends after {maxDownloads} downloads or at the selected expiry time.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Your Active Uploads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingUploads ? (
                                <div className="flex justify-center p-4">
                                    <div className="h-6 w-6 border-2 border-university-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : myUploads.length === 0 ? (
                                <div className="text-center p-6 text-muted-foreground border border-dashed rounded-lg">
                                    You have no active uploads.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myUploads.map((u) => (
                                        <div key={u.shareId} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    {u.hasText && u.filesCount === 0 ? (
                                                        <FileText className="h-4 w-4 text-university-500 shrink-0" />
                                                    ) : (
                                                        <FileIcon className="h-4 w-4 text-university-500 shrink-0" />
                                                    )}
                                                    <p className="font-medium truncate">{u.displayName}</p>
                                                    {!u.isPublic && (
                                                        <span className="bg-university-100 text-university-800 text-[11px] px-1.5 py-0.5 rounded font-medium">
                                                            Private ({u.allowedRegNos?.length || 0})
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                    <span>{(u.totalBytes / 1024 / 1024).toFixed(1)} MB</span>
                                                    <span>•</span>
                                                    <span>{u.maxDownloads - u.remainingDownloads} / {u.maxDownloads} DLs</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {u.shareLink ? (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(u.shareLink, u.shareId)}
                                                        >
                                                            {copied === u.shareId ? <Check className="h-4 w-4 text-green-600 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                                            Copy
                                                        </Button>
                                                        <Link href={u.shareLink} target="_blank">
                                                            <Button variant="ghost" size="sm" className="px-2">
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        Key Lost
                                                    </div>
                                                )}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="px-2">
                                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() => openEditAccessDialog(u)}
                                                        >
                                                            <Users className="h-4 w-4 mr-2" />
                                                            Edit Access
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive cursor-pointer"
                                                            onSelect={() => deleteUpload(u.shareId)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete File
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="received">
                    <Card>
                        <CardHeader>
                            <CardTitle>Files Shared With You</CardTitle>
                            <CardDescription>Secure links that friends have shared specifically with your account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingReceived ? (
                                <div className="flex justify-center p-4">
                                    <div className="h-6 w-6 border-2 border-university-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : receivedUploads.length === 0 ? (
                                <div className="text-center p-6 text-muted-foreground border border-dashed rounded-lg">
                                    No one has shared a file with you yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {receivedUploads.map((u) => (
                                        <div key={u.shareId} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    {u.hasText && u.filesCount === 0 ? (
                                                        <FileText className="h-4 w-4 text-university-500 shrink-0" />
                                                    ) : (
                                                        <FileIcon className="h-4 w-4 text-university-500 shrink-0" />
                                                    )}
                                                    <p className="font-medium truncate">{u.displayName}</p>
                                                    <span className="bg-university-100 text-university-800 text-xs px-2 py-0.5 rounded ml-2 flex items-center">
                                                        From: {u.creatorUsername}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                    <span>{(u.totalBytes / 1024 / 1024).toFixed(1)} MB</span>
                                                    <span>•</span>
                                                    <span>{u.maxDownloads - u.remainingDownloads} / {u.maxDownloads} DLs</span>
                                                    {u.isPasswordProtected ? (
                                                        <span className="text-amber-500 font-medium ml-2 border border-amber-200 bg-amber-50 px-1 rounded">Password Protected</span>
                                                    ) : (
                                                        <span className="text-green-500 font-medium ml-2 border border-green-200 bg-green-50 px-1 rounded">Public</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Link href={u.shareLink} target="_blank">
                                                    <Button variant="default" size="sm">
                                                        Open Link <ExternalLink className="h-4 w-4 ml-2" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={!!selectedShareForEdit} onOpenChange={(open) => { if (!open) setSelectedShareForEdit(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Share Access</DialogTitle>
                        <DialogDescription>Update who can view and access this share.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-3">
                            <Label>Sharing Option</Label>
                            <div className="flex gap-4">
                                <div 
                                    className={`flex-1 p-3 border rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${editShareType === "public" ? "bg-university-50 border-university-200 dark:bg-university-900/30 dark:border-university-800" : "hover:bg-muted/50"}`}
                                    onClick={() => setEditShareType("public")}
                                >
                                    <Globe className="h-5 w-5 text-university-500" />
                                    <div>
                                        <p className="text-sm font-medium">Public</p>
                                        <p className="text-xs text-muted-foreground">Anyone with the link</p>
                                    </div>
                                </div>
                                <div 
                                    className={`flex-1 p-3 border rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${editShareType === "friend" ? "bg-university-50 border-university-200 dark:bg-university-900/30 dark:border-university-800" : "hover:bg-muted/50"}`}
                                    onClick={() => setEditShareType("friend")}
                                >
                                    <Users className="h-5 w-5 text-university-500" />
                                    <div>
                                        <p className="text-sm font-medium">Friend</p>
                                        <p className="text-xs text-muted-foreground">Specific user only</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {editShareType === "friend" && (
                            <div className="space-y-3">
                                <Label>Friend's Registration Numbers</Label>
                                {editFriendRegNos.map((regNo, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            placeholder="e.g. AP2411..."
                                            value={regNo}
                                            onChange={(e) => {
                                                const newRegNos = [...editFriendRegNos];
                                                newRegNos[idx] = e.target.value;
                                                setEditFriendRegNos(newRegNos);
                                            }}
                                        />
                                        {editFriendRegNos.length > 1 && (
                                            <Button variant="ghost" className="px-2 shrink-0" onClick={() => setEditFriendRegNos(editFriendRegNos.filter((_, i) => i !== idx))}>
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {editFriendRegNos.length < 10 && (
                                    <Button variant="outline" size="sm" onClick={() => setEditFriendRegNos([...editFriendRegNos, ""])} className="w-full">
                                        + Add user
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedShareForEdit(null)}>Cancel</Button>
                        <Button onClick={saveEditedAccess} disabled={isSavingAccess} className="bg-university-700 hover:bg-university-800 text-white">
                            {isSavingAccess ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!unregisteredWarning} onOpenChange={(open) => { if (!open) setUnregisteredWarning(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-amber-600 dark:text-amber-500 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Partial Success
                        </DialogTitle>
                        <DialogDescription>
                            The secure link was successfully generated and shared with registered users. However, the following users are <strong>not registered</strong> on our website:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted/50 p-4 rounded-lg my-2 max-h-40 overflow-y-auto">
                        <ul className="list-disc list-inside text-sm font-medium">
                            {unregisteredWarning?.map((u) => <li key={u}>{u}</li>)}
                        </ul>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Please share the website link with them so they can register and access the file.
                    </p>
                    <DialogFooter>
                        <Button onClick={() => setUnregisteredWarning(null)} className="w-full sm:w-auto">
                            Got it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SecureShare;

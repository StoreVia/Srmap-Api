"use client";
import axios from "axios";
import API from "@/lib/api/axiosClient";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/utils/useToast";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import SessionCard from "@/components/utils/SessionCard";
import { useStudentData } from "@/context/StudentContext";
import { isValidComment } from "@/validators/srmapi/feedback";
import { isSessionValid, whatsapp } from "@/shared/utils/functions";
import { useSessionValidator } from "@/hooks/auth/useSessionValidator";
import FeedbackInfoDialog from "@/components/page/feedback/InfoDialog";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Info, ExternalLink, BookOpen, CheckSquare, Square, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface Subject {
    id: string;
    name: string;
    faculty: string;
}

const Feedback = () => {
    const { toast } = useToast();
    const { profile } = useStudentData();
    const { sessionValid, sessionId } = useSessionValidator();
    const { settings, updateSettings } = useLocalStorageContext();
    const router = useRouter();

    const [selectedOption, setSelectedOption] = useState("5");
    const [comment, setComment] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [response, setReponse] = useState<string | null>(null);
    const [loadingComments, setLoadingComments] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [subjectsOpen, setSubjectsOpen] = useState(false);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const feedbackOptions = [
        { value: "1", label: "Strongly Disagree" },
        { value: "2", label: "Disagree" },
        { value: "3", label: "Neutral" },
        { value: "4", label: "Agree" },
        { value: "5", label: "Strongly Agree" }
    ];

    useEffect(() => {
        if (!settings.feedbackExplanationSeen) {
            setShowExplanation(true);
            updateSettings({ feedbackExplanationSeen: true });
        }
    }, [settings.feedbackExplanationSeen]);

    const loadSubjects = async (showToast:boolean = true) => {
        if (!sessionId) return;
        setLoadingSubjects(true);
        try {
            const res = await API.post('/srmapi/feedback/subjects', { sessionId });
            if (res.data.success && res.data.subjects) {
                setSubjects(res.data.subjects);
                setSelectedSubjectIds(res.data.subjects.map((s: Subject) => s.id));
            } else {
                if(showToast) toast({ title: "Error", description: res.data.message || "Failed to load subjects.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to load subjects.", variant: "destructive" });
        } finally {
            setLoadingSubjects(false);
        }
    };

    const loadFeedbackComments = async () => {
        setLoadingComments(true);
        try {
            const response = await API.get('/srmapi/feedback/comment');
            if (response.data.comment) {
                setComment(response.data.comment);
            } else {
                toast({ title: "Error", description: "Loading A Random Comment Failed Fill Comment Your Self.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Loading A Random Comment Failed Fill Comment Your Self.", variant: "destructive" });
        } finally {
            setLoadingComments(false);
        }
    };

    const toggleSubject = (id: string) => {
        setSelectedSubjectIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleAllSubjects = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedSubjectIds.length === subjects.length) {
            setSelectedSubjectIds([]);
        } else {
            setSelectedSubjectIds(subjects.map(s => s.id));
        }
    };

    const handleSubmitClick = () => {
        if (!selectedOption || !comment.trim()) {
            toast({ title: "Error", description: "Please Fill All Required Fields!", variant: "destructive" });
            return;
        }
        const [isValid, message] = isValidComment(comment);
        if (!isValid) {
            toast({ title: "Error", description: message || "Something went wrong!", variant: "destructive" });
            return;
        }
        if (selectedSubjectIds.length === 0) {
            toast({ title: "Error", description: "Please select at least one subject!", variant: "destructive" });
            return;
        }
        setConfirmDialogOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setConfirmDialogOpen(false);
        setLoading(true);
        try {
            const res = await API.post('/srmapi/feedback/submit', {
                sessionId,
                comment,
                optionNo: selectedOption,
                selectedSubjectIds
            });
            setReponse(res.data.message);
        } catch (error) {
            setReponse(axios.isAxiosError(error) ? error.response?.data?.message : null);
        } finally {
            setLoading(false);
            setSuccessDialogOpen(true);
            loadSubjects(false);
        }
    };

    useEffect(() => {
        loadFeedbackComments();
    }, []);

    useEffect(() => {
        if (sessionValid && sessionId) {
            loadSubjects();
        }
    }, [sessionValid, sessionId]);

    const selectedSubjects = subjects.filter(s => selectedSubjectIds.includes(s.id));
    const allSelected = subjects.length > 0 && selectedSubjectIds.length === subjects.length;

    return (
        <div>
            <FeedbackInfoDialog open={showExplanation || infoDialogOpen} onOpenChange={(open) => { if (!open) setShowExplanation(false), setInfoDialogOpen(false) }} />

            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Confirm Feedback Submission</DialogTitle>
                        <DialogDescription>
                            You are about to submit feedback for the following {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''}:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-64 overflow-y-auto space-y-2 py-2">
                        {selectedSubjects.map(subject => (
                            <div key={subject.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                                <BookOpen className="h-4 w-4 mt-0.5 text-university-600 dark:text-university-400 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium leading-tight truncate">{subject.name || subject.id}</p>
                                    {subject.faculty && (
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{subject.faculty}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                        <span className="text-muted-foreground">Rating:</span>
                        <Badge variant="secondary">{feedbackOptions.find(o => o.value === selectedOption)?.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                        <span className="text-muted-foreground">Comment:</span>
                        <Badge variant="secondary">{comment}</Badge>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} className="flex-1">Cancel</Button>
                        <Button onClick={handleConfirmSubmit} className="flex-1 bg-university-700 hover:bg-university-800 dark:bg-university-500 dark:hover:bg-university-600 text-white">
                            Submit Feedback
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            {response ? response : "Feedback Submitted Successfully!"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center space-y-4 py-4">
                        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
                            <p className="text-sm text-green-800 dark:text-green-200">Checkout out our new omegle page!</p>
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full">
                        <Button variant="outline" onClick={() => setSuccessDialogOpen(false)} className="w-full sm:w-auto sm:flex-1 min-w-[120px]">
                            Maybe Later
                        </Button>
                        <Button onClick={() => router.push("/omegle")} className="w-full sm:w-auto sm:flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white">
                            <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
                            <span className="truncate">Omegele</span>
                        </Button>
                        <Button onClick={() => whatsapp()} className="w-full sm:w-auto sm:flex-1 min-w-[160px] bg-green-600 hover:bg-green-700 text-white">
                            <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
                            <span className="truncate">Join WhatsApp Channel</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Feedback Form</CardTitle>
                                <CardDescription>These Selected Options Will Apply For Every Faculty.</CardDescription>
                                <p className="text-green-500">Default: "Strongly Agree" selected with random comment loaded</p>
                            </div>
                            <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                        <Info className="h-4 w-4" />
                                        Info
                                    </Button>
                                </DialogTrigger>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {sessionValid ? (
                            <div>
                                <div className="space-y-3">
                                    <Label>Feedback Options</Label>
                                    <div className="space-y-2">
                                        {feedbackOptions.map((option) => (
                                            <div key={option.value} className="flex items-center space-x-3">
                                                <label className="custom-container">
                                                    <input
                                                        type="radio"
                                                        name="feedback-option"
                                                        value={option.value}
                                                        checked={selectedOption === option.value}
                                                        onChange={(e) => setSelectedOption(e.target.value)}
                                                    />
                                                    <div className="checkmark"></div>
                                                </label>
                                                <Label className="text-sm font-medium cursor-pointer select-none">
                                                    {option.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <div
                                        onClick={() => !loadingSubjects && setSubjectsOpen(prev => !prev)}
                                        className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-border bg-background cursor-pointer hover:bg-muted/40 transition-colors select-none"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span className="text-sm font-medium truncate">
                                                {loadingSubjects ? "Loading subjects..." : subjects.length === 0 ? "No subjects found" : `Customize Subj's`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                            {!loadingSubjects && subjects.length > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={toggleAllSubjects}
                                                    className="text-xs h-6 px-2 flex items-center gap-1"
                                                >
                                                    {allSelected ? (
                                                        <><CheckSquare className="h-3 w-3" /><span className="hidden sm:inline">Deselect All</span></>
                                                    ) : (
                                                        <><Square className="h-3 w-3" /><span className="hidden sm:inline">Select All</span></>
                                                    )}
                                                </Button>
                                            )}
                                            {subjects.length > 0 && (
                                                subjectsOpen
                                                    ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                    : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>

                                    {subjectsOpen && !loadingSubjects && (
                                        subjects.length === 0 ? (
                                            <div className="text-center py-5 text-sm text-muted-foreground border rounded-lg border-dashed">
                                                No subjects found or feedback already submitted.
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5 max-h-56 overflow-y-auto rounded-lg border border-border p-1.5">
                                                {subjects.map((subject) => (
                                                    <div
                                                        key={subject.id}
                                                        onClick={() => toggleSubject(subject.id)}
                                                        className={`flex items-start gap-3 p-2.5 rounded-md border cursor-pointer transition-colors ${selectedSubjectIds.includes(subject.id)
                                                                ? 'border-university-500 bg-university-50 dark:bg-university-900/20'
                                                                : 'border-transparent bg-background hover:bg-muted/40'
                                                            }`}
                                                    >
                                                        <Checkbox
                                                            checked={selectedSubjectIds.includes(subject.id)}
                                                            onCheckedChange={() => toggleSubject(subject.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="mt-0.5 shrink-0"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium leading-tight">{subject.name || subject.id}</p>
                                                            {subject.faculty && (
                                                                <p className="text-xs text-muted-foreground mt-0.5">{subject.faculty}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="space-y-2 mt-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <Label htmlFor="comment">Comment</Label>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={loadFeedbackComments}
                                                disabled={loadingComments}
                                                className="flex items-center gap-1"
                                            >
                                                <RefreshCw className={`h-3 w-3 ${loadingComments ? 'animate-spin' : ''}`} />
                                                Refresh Comment
                                            </Button>
                                            <span className="text-sm text-muted-foreground sm:ml-2">
                                                {comment.length}/256 characters
                                            </span>
                                        </div>
                                    </div>
                                    <Textarea
                                        id="comment"
                                        placeholder="Enter your detailed feedback (max 256 characters) or use refresh to get random comment"
                                        value={comment}
                                        onChange={e => e.target.value.length <= 500 && setComment(e.target.value)}
                                        className="min-h-[120px] resize-none"
                                        maxLength={500}
                                    />
                                    <p className="text-xs text-gray-500">{comment.length}/500 characters</p>
                                </div>

                                <Button
                                    onClick={handleSubmitClick}
                                    disabled={loading || !selectedOption || !comment.trim() || selectedSubjectIds.length === 0}
                                    className="mt-3 w-full sm:w-auto bg-university-700 hover:bg-university-800 dark:bg-university-500 dark:hover:bg-university-600 text-white dark:text-white"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2 justify-center">
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Submitting Feedback...
                                        </span>
                                    ) : (
                                        `Auto Submit Feedback${selectedSubjectIds.length > 0 ? ` (${selectedSubjectIds.length})` : ''}`
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <SessionCard />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Feedback;
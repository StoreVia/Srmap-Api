"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import API from "@/components/client/api/AxiosClient";
import SessionCard from "@/components/utils/SessionCard";
import { useStudentData } from "@/context/StudentContext";
import { RefreshCw, Info, ExternalLink } from "lucide-react";
import { isValidComment } from "@/validators/srmapi/feedback";
import { useSessionValidator } from "@/hooks/useSessionValidator";
import FeedbackInfoDialog from "@/components/page/feedback/InfoDialog";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { isSessionValid, whatsapp } from "@/fullStackUtils/utils/functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Feedback = () => {
    const { toast } = useToast();
    const { profile } = useStudentData();
    const { sessionValid, sessionId } = useSessionValidator();
    const { settings, updateSettings } = useLocalStorageContext();

    const [selectedOption, setSelectedOption] = useState("5");
    const [comment, setComment] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [response, setReponse] = useState<string | null>(null);
    const [loadingComments, setLoadingComments] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

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

    const loadFeedbackComments = async () => {
        setLoadingComments(true);
        try {
            const response = await API.get('/srmapi/feedback/comment');
            if (response.data.comment) {
                setComment(response.data.comment);
            } else {
                toast({
                    title: "Error",
                    description: "Loading A Random Comment Failed Fill Comment Your Self.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Loading A Random Comment Failed Fill Comment Your Self.",
                variant: "destructive",
            });
        } finally {
            setLoadingComments(false);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!selectedOption || !comment.trim()) {
            toast({
                title: "Error",
                description: "Please Fill All Required Fields!",
                variant: "destructive",
            });
            return;
        }

        const [isValid, message] = isValidComment(comment);
        if (!isValid) {
            toast({
                title: "Error",
                description: message || "Something went wrong!",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);
        try {
            const response = await API.post('/srmapi/feedback/submit', { sessionId: sessionId, comment, optionNo: selectedOption });
            setReponse(response.data.message);
        } catch (error) {
            setReponse(axios.isAxiosError(error) ? error.response?.data?.message : null);
        } finally {
            setLoading(false);
            setSuccessDialogOpen(true);
        }
    };

    useEffect(() => {
        loadFeedbackComments();
    }, [])

    return (
        <div>
            <FeedbackInfoDialog open={showExplanation || infoDialogOpen} onOpenChange={(open) => { if (!open) setShowExplanation(false), setInfoDialogOpen(false) }} />

            <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            {response ? response : "Feedback Submitted Successfully!"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center space-y-4 py-4">
                        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
                            <p className="text-sm text-green-800 dark:text-green-200">
                                Support our website by joining our WhatsApp group for updates!
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setSuccessDialogOpen(false)}
                            className="flex-1"
                        >
                            Maybe Later
                        </Button>
                        <Button
                            onClick={() => whatsapp()}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Join WhatsApp Group
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Endterm Feedback</h2>
                <p className="text-muted-foreground">Submit Your Course Feedback</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Information</CardTitle>
                        <CardDescription>Current User Details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            Registration Number:{" "}
                            <span className="font-medium">{profile?.registerNo}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Ensure all information is correct before submitting your feedback.
                        </p>
                    </CardContent>
                </Card>

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
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1"
                                    >
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
                                <div className="space-y-2">
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
                                    onClick={handleSubmitFeedback}
                                    disabled={loading || !selectedOption || !comment.trim()}
                                    className="mt-3 w-full sm:w-auto bg-university-700 hover:bg-university-800 dark:bg-university-500 dark:hover:bg-university-600 text-white dark:text-white"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2 justify-center">
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Submitting Feedback...
                                        </span>
                                    ) : (
                                        "Auto Submit Feedback"
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
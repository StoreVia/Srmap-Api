"use client";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

interface FeedbackInfoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const FeedbackInfoDialog = ({ open, onOpenChange }: FeedbackInfoDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-500" />
                        Feedback Feature
                    </DialogTitle>
                    <DialogDescription>
                        Starting 27-OCT-2025, you'll need to submit end-term feedback for each faculty, totaling around 150 questions. This tool allows you to auto-submit your feedback with one click.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                    <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                            <span className="text-blue-500 font-semibold">•</span>
                            <span><strong>Auto-filled:</strong> Pre-filled with "Strongly Agree" and random comment.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-blue-500 font-semibold">•</span>
                            <span><strong>Customize:</strong> Modify rating and comment before submitting.</span>
                        </div>
                        <div className="flex items-start gap-2 text-red-500 animate-pulse">
                            <span className="text-blue-500 font-semibold">•</span>
                            <span><strong>Applies to all:</strong> Rating applies to all faculty members.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-blue-500 font-semibold">•</span>
                            <span><strong>Refresh Comment: (Button)</strong> Get different random comments with Refresh button.</span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose>
                        <Button>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FeedbackInfoDialog;
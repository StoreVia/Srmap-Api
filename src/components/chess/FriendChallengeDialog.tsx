import React, { useState } from 'react';
import { Loader2, Send, UserCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FriendChallengeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSendChallenge: (friendRegNumber: string) => void;
  selectedTimeControl: number;
  statusMessage: string | null;
  isSending: boolean;
}

export const FriendChallengeDialog: React.FC<FriendChallengeDialogProps> = ({
  isOpen,
  onClose,
  onSendChallenge,
  selectedTimeControl,
  isSending,
}) => {
  const [regNumber, setRegNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber.trim()) return;
    onSendChallenge(regNumber.trim());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md p-6 rounded-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Play with Friend</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Challenge a classmate ({Math.floor(selectedTimeControl / 60)} min match)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground block">
              Friend&apos;s Registration Number
            </label>
            <input
              type="text"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
              placeholder="e.g. AP21110010000"
              className="w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-[16px] sm:text-sm font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!regNumber.trim() || isSending}
              className="rounded-xl text-xs gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking & Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Challenge
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
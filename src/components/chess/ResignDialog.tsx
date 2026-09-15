import React from 'react';
import { AlertTriangle, Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ResignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmResign: () => void;
}

export const ResignDialog: React.FC<ResignDialogProps> = ({
  isOpen,
  onClose,
  onConfirmResign,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-sm p-6 rounded-2xl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto p-3 rounded-full bg-destructive/10 text-destructive w-fit">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <DialogTitle className="text-base font-semibold">Resign Game?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to forfeit? Your opponent will be awarded the victory.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex items-center justify-center gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirmResign();
              onClose();
            }}
            className="flex-1 rounded-xl text-xs gap-1.5"
          >
            <Flag className="w-3.5 h-3.5" />
            Resign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
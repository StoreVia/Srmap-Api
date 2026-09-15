import React from 'react';
import { Handshake } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DrawOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDraw: () => void;
}

export const DrawOfferDialog: React.FC<DrawOfferDialogProps> = ({
  isOpen,
  onClose,
  onConfirmDraw,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-sm p-6 rounded-2xl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto p-3 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <Handshake className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <DialogTitle className="text-base font-semibold">Offer Draw?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to offer a draw? Your opponent can accept or decline.
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
            onClick={() => {
              onConfirmDraw();
              onClose();
            }}
            className="flex-1 rounded-xl text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Handshake className="w-3.5 h-3.5" />
            Offer Draw
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

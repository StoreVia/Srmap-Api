import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Turnstile } from "@/components/utils/Turnstile";

interface CachedDataPromptProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: (turnstileToken?: string) => void;
  onCancel: () => void;
  cancelText?: string;
  description?: string;
  requireTurnstile?: boolean;
}

export function CachedDataPrompt({ 
  open, 
  onOpenChange, 
  onConfirm, 
  onCancel, 
  cancelText = "Cancel", 
  description = "The college portal is currently down. Would you like to load your last updated data?",
  requireTurnstile = false
}: CachedDataPromptProps) {
  const { theme } = useTheme();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTurnstileToken(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white text-gray-900"}>
        <DialogHeader>
          <DialogTitle>Server Unreachable</DialogTitle>
          <DialogDescription className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            {description}
          </DialogDescription>
        </DialogHeader>
        {requireTurnstile && open && (
          <div className="flex justify-center my-3">
            <Turnstile
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              theme={theme === "dark" ? "dark" : "light"}
            />
          </div>
        )}
        <DialogFooter className="flex gap-2 justify-end sm:justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className={theme === "dark" ? "border-gray-600 hover:bg-gray-700 text-white" : ""}
          >
            {cancelText}
          </Button>
          <Button 
            onClick={() => onConfirm(turnstileToken || undefined)}
            disabled={requireTurnstile && !turnstileToken}
          >
            Use Cached Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

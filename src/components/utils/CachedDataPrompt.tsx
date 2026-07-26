import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CachedDataPromptProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  cancelText?: string;
  description?: string;
}

export function CachedDataPrompt({ 
  open, 
  onOpenChange, 
  onConfirm, 
  onCancel, 
  cancelText = "Cancel", 
  description = "The college portal is currently down. Would you like to load your last updated data?" 
}: CachedDataPromptProps) {
  const { theme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white text-gray-900"}>
        <DialogHeader>
          <DialogTitle>Server Unreachable</DialogTitle>
          <DialogDescription className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 justify-end sm:justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className={theme === "dark" ? "border-gray-600 hover:bg-gray-700 text-white" : ""}
          >
            {cancelText}
          </Button>
          <Button onClick={onConfirm}>
            Use Cached Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

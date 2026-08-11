"use client";
import { Code } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface JsonViewerModalProps {
  data: any | null;
  onClose: () => void;
}

export function JsonViewerModal({ data, onClose }: JsonViewerModalProps) {
  return (
    <Dialog open={Boolean(data)} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto border-neutral-800 bg-neutral-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <Code className="h-4 w-4 text-purple-400" />
            Raw MongoDB JSON: {data?.Name} ({data?.Slug})
          </DialogTitle>
        </DialogHeader>
        <pre className="rounded-lg bg-neutral-900 p-4 text-xs font-mono text-purple-300 overflow-x-auto border border-neutral-800">
          {JSON.stringify(data, null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  );
}
"use client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OptionItem } from "./types";

interface OptionArrayEditorProps {
  title: string;
  icon: any;
  items?: OptionItem[];
  onChange: (newItems: OptionItem[]) => void;
  isSubtitle?: boolean;
}

export function OptionArrayEditor({
  title,
  icon: IconComp,
  items = [],
  onChange,
  isSubtitle = false,
}: OptionArrayEditorProps) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
          <IconComp className="h-3.5 w-3.5 text-blue-400" /> {title} ({items.length})
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            onChange([
              ...items,
              isSubtitle
                ? { name: "New Subtitle", url: "", code: "" }
                : { name: "New Item", code: "code" },
            ])
          }
          className="h-6 text-[10px] border-neutral-700 px-2"
        >
          <Plus className="mr-1 h-3 w-3" /> Add {isSubtitle ? "Subtitle" : "Option"}
        </Button>
      </div>

      {items.map((item, idx) => (
        <div key={idx} className="rounded border border-neutral-800 bg-neutral-900 p-2 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Name (e.g. English, 1080p)"
              value={item.name || ""}
              onChange={(e) => {
                const updated = [...items];
                updated[idx].name = e.target.value;
                onChange(updated);
              }}
              className="h-7 text-xs border-neutral-800 bg-neutral-950 text-white"
            />
            {!isSubtitle && (
              <Input
                placeholder="Code (e.g. 1080p, 0)"
                value={item.code || ""}
                onChange={(e) => {
                  const updated = [...items];
                  updated[idx].code = e.target.value;
                  onChange(updated);
                }}
                className="h-7 text-xs border-neutral-800 bg-neutral-950 text-white"
              />
            )}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="h-7 w-7 p-0 text-red-400 hover:bg-red-950/50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {isSubtitle && (
            <div className="space-y-1.5 text-xs">
              <Input
                placeholder="CDN Subtitle URL (https://...)"
                value={item.url || ""}
                onChange={(e) => {
                  const updated = [...items];
                  updated[idx].url = e.target.value;
                  onChange(updated);
                }}
                className="h-7 text-xs border-neutral-800 bg-neutral-950 text-white"
              />
              <Textarea
                placeholder="Raw SRT/VTT Subtitle Content (optional)..."
                rows={2}
                value={item.code || ""}
                onChange={(e) => {
                  const updated = [...items];
                  updated[idx].code = e.target.value;
                  onChange(updated);
                }}
                className="font-mono text-[11px] border-neutral-800 bg-neutral-950 text-neutral-300"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
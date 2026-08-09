"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StreamConfig } from "./types";

interface StreamConfigEditorProps {
  config?: StreamConfig;
  onChange: (newConfig: StreamConfig) => void;
  compact?: boolean;
}

export function StreamConfigEditor({ config, onChange, compact = false }: StreamConfigEditorProps) {
  const videoConf = config?.video || {};
  const audioConf = config?.audio || {};

  const handleVideoChange = (key: string, value: any) => {
    onChange({
      ...config,
      video: { ...videoConf, [key]: value },
    });
  };

  const handleAudioChange = (key: string, value: any) => {
    onChange({
      ...config,
      audio: { ...audioConf, [key]: value },
    });
  };

  const inputHeight = compact ? "h-6 text-[11px]" : "h-7 text-xs";
  const labelSize = compact ? "text-[10px]" : "text-xs";

  return (
    <div className={`grid gap-3 sm:grid-cols-2 border-t border-neutral-800 pt-2 ${compact ? "text-xs" : ""}`}>
      <div className="space-y-1">
        <span className={`${labelSize} font-semibold text-neutral-300`}>Video Segment Config</span>
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="text-[10px] text-neutral-500">Prefix Code</label>
            <Input
              placeholder="1065"
              value={videoConf.prefixCode || ""}
              onChange={(e) => handleVideoChange("prefixCode", e.target.value)}
              className={`${inputHeight} border-neutral-800 bg-neutral-900 text-white`}
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500">Padding</label>
            <Input
              type="number"
              placeholder="3"
              value={videoConf.segmentPadding ?? 3}
              onChange={(e) => handleVideoChange("segmentPadding", Number(e.target.value))}
              className={`${inputHeight} border-neutral-800 bg-neutral-900 text-white`}
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500">Start Segment</label>
            <Input
              type="number"
              placeholder="0"
              value={videoConf.startSegment ?? 0}
              onChange={(e) => handleVideoChange("startSegment", Number(e.target.value))}
              className={`${inputHeight} border-neutral-800 bg-neutral-900 text-white`}
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500">End Segment</label>
            <Input
              type="number"
              placeholder="760"
              value={videoConf.endSegment ?? 760}
              onChange={(e) => handleVideoChange("endSegment", Number(e.target.value))}
              className={`${inputHeight} border-neutral-800 bg-neutral-900 text-white`}
            />
          </div>
        </div>
        <div className="pt-1">
          <label className="text-[10px] text-neutral-500">Video M3U8 Segment File</label>
          <Textarea
            placeholder={'#EXTM3U\n#EXTINF:9.125000,\n9977_000.jpg'}
            rows={compact ? 5 : 8}
            value={videoConf.segmentFile || ""}
            onChange={(e) => handleVideoChange("segmentFile", e.target.value)}
            className="mt-1 resize-y border-neutral-800 bg-neutral-900 font-mono text-[11px] text-white"
          />
          <p className="mt-1 text-[10px] text-neutral-500">Exact segment durations and filenames are used when provided.</p>
        </div>
      </div>

      <div className="space-y-1">
        <span className={`${labelSize} font-semibold text-neutral-300`}>Audio Segment Config</span>
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="text-[10px] text-neutral-500">Prefix Code</label>
            <Input
              placeholder="1065"
              value={audioConf.prefixCode || ""}
              onChange={(e) => handleAudioChange("prefixCode", e.target.value)}
              className={`${inputHeight} border-neutral-800 bg-neutral-900 text-white`}
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500">Padding</label>
            <Input
              type="number"
              placeholder="3"
              value={audioConf.segmentPadding ?? 3}
              onChange={(e) => handleAudioChange("segmentPadding", Number(e.target.value))}
              className={`${inputHeight} border-neutral-800 bg-neutral-900 text-white`}
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500">Start Segment</label>
            <Input
              type="number"
              placeholder="0"
              value={audioConf.startSegment ?? 0}
              onChange={(e) => handleAudioChange("startSegment", Number(e.target.value))}
              className={`${inputHeight} border-neutral-800 bg-neutral-900 text-white`}
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500">End Segment</label>
            <Input
              type="number"
              placeholder="760"
              value={audioConf.endSegment ?? 760}
              onChange={(e) => handleAudioChange("endSegment", Number(e.target.value))}
              className={`${inputHeight} border-neutral-800 bg-neutral-900 text-white`}
            />
          </div>
        </div>
        <div className="pt-1">
          <label className="text-[10px] text-neutral-500">Audio M3U8 Segment File</label>
          <Textarea
            placeholder={'#EXTM3U\n#EXTINF:8.981333,\n9977_000.js'}
            rows={compact ? 5 : 8}
            value={audioConf.segmentFile || ""}
            onChange={(e) => handleAudioChange("segmentFile", e.target.value)}
            className="mt-1 resize-y border-neutral-800 bg-neutral-900 font-mono text-[11px] text-white"
          />
          <p className="mt-1 text-[10px] text-neutral-500">Exact segment durations and filenames are used when provided.</p>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { Button } from "@/components/ui/button";

const parseDescription = (text: string) => {
  const paragraphs = text.split(/\n{2,}/);

  return paragraphs.map((para, i) => {
    const lines = para.split(/\n/).map((line, j) => {
      const segments = line.split(/(\*\*.*?\*\*)/g).map((seg, k) => {
        if (/^\*\*.*\*\*$/.test(seg)) {
          return (
            <strong key={k} className="font-semibold">
              {seg.replace(/\*\*/g, "")}
            </strong>
          );
        }
        return <span key={k}>{seg}</span>;
      });

      return (
        <div key={j} className="mb-1">
          {segments}
        </div>
      );
    });

    return (
      <div key={i} className="mb-3">
        {lines}
      </div>
    );
  });
};

interface InfoBoxProps {
  title: string;
  description: string;
  warning: string;
  buttonName: string;
  buttonTheme: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  title,
  description,
  warning,
  buttonName,
  buttonTheme,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 rounded-xl shadow-xl space-y-4 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h2>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {parseDescription(description)}
        </div>
        <p className="text-sm text-red-600 font-medium">{warning}</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className={buttonTheme}>
            {buttonName}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
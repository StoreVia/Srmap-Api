import React from 'react';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';

interface MoveControlsProps {
  currentIndex: number;
  totalMoves: number;
  onNavigate: (index: number) => void;
}

export const MoveControls: React.FC<MoveControlsProps> = ({
  currentIndex,
  totalMoves,
  onNavigate,
}) => {
  const isAtStart = currentIndex === -1;
  const isAtEnd = currentIndex === totalMoves - 1;

  return (
    <div className="flex items-center justify-between bg-card/80 backdrop-blur-sm border rounded-xl px-4 py-2.5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onNavigate(-1)}
          disabled={isAtStart || totalMoves === 0}
          className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition"
          title="Start position"
        >
          <ChevronFirst className="w-5 h-5" />
        </button>
        <button
          onClick={() => onNavigate(Math.max(-1, currentIndex - 1))}
          disabled={isAtStart || totalMoves === 0}
          className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition"
          title="Previous move"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="text-xs font-medium text-muted-foreground select-none">
        {totalMoves === 0
          ? 'Game Started'
          : isAtEnd
          ? `Live (Move ${totalMoves})`
          : isAtStart
          ? 'Start Position'
          : `Move ${currentIndex + 1} / ${totalMoves}`}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onNavigate(Math.min(totalMoves - 1, currentIndex + 1))}
          disabled={isAtEnd || totalMoves === 0}
          className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition"
          title="Next move"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => onNavigate(totalMoves - 1)}
          disabled={isAtEnd || totalMoves === 0}
          className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition"
          title="Latest move"
        >
          <ChevronLast className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
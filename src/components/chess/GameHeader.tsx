import React from 'react';
import { Flag, Handshake, Timer } from 'lucide-react';

interface GameHeaderProps {
  playerColor: 'w' | 'b';
  opponentName: string;
  opponentReg: string;
  turn: 'w' | 'b';
  whiteTime: number;
  blackTime: number;
  isDrawOfferedByOpponent: boolean;
  onResign: () => void;
  onOfferDraw: () => void;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  playerColor,
  opponentName,
  opponentReg,
  turn,
  whiteTime,
  blackTime,
  isDrawOfferedByOpponent,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isMyTurn = turn === playerColor;
  const myTime = playerColor === 'w' ? whiteTime : blackTime;
  const oppTime = playerColor === 'w' ? blackTime : whiteTime;

  const oppColor = playerColor === 'w' ? 'b' : 'w';

  return (
    <div className="w-full bg-card/80 backdrop-blur-sm border rounded-2xl p-3 sm:p-4 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ${
              oppColor === 'w'
                ? 'bg-white border-2 border-slate-300'
                : 'bg-slate-950 border-2 border-slate-600'
            }`}
            title={oppColor === 'w' ? 'White' : 'Black'}
          />
          <div className="min-w-0 truncate">
            <div className="font-semibold text-xs sm:text-sm leading-tight truncate">{opponentName}</div>
            <div className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
              {opponentReg ? `${opponentReg} • ` : ''}{oppColor === 'w' ? 'White' : 'Black'}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold tracking-wider shrink-0 ${
            turn !== playerColor
              ? 'bg-primary/10 text-primary border border-primary/20 animate-pulse'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {formatTime(oppTime)}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ${
              playerColor === 'w'
                ? 'bg-white border-2 border-slate-300'
                : 'bg-slate-950 border-2 border-slate-600'
            }`}
            title={playerColor === 'w' ? 'White' : 'Black'}
          />
          <div className="min-w-0 truncate">
            <div className="font-semibold text-xs sm:text-sm leading-tight">You</div>
            <div className="text-[10px] sm:text-[11px] text-muted-foreground truncate font-medium">
              {playerColor === 'w' ? 'White' : 'Black'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold tracking-wider ${
              isMyTurn
                ? 'bg-primary/10 text-primary border border-primary/20 animate-pulse'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {formatTime(myTime)}
          </div>

          <button
            onClick={onOfferDraw}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition"
            title="Offer Draw"
          >
            <Handshake className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={onResign}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-destructive/10 text-destructive transition"
            title="Resign"
          >
            <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {isDrawOfferedByOpponent && (
        <div className="p-2.5 sm:p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs animate-in fade-in gap-2">
          <span className="text-amber-800 dark:text-amber-200 font-medium text-[11px] sm:text-xs truncate">
            Opponent offered a draw.
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onAcceptDraw}
              className="px-2.5 py-1 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:opacity-90 transition"
            >
              Accept
            </button>
            <button
              onClick={onDeclineDraw}
              className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-xs rounded-lg transition"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
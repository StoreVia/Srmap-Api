import React from 'react';
import { Loader2, WifiOff } from 'lucide-react';

interface ReconnectingOverlayProps {
  countdown: number;
  isOpponent?: boolean;
}

export const ReconnectingOverlay: React.FC<ReconnectingOverlayProps> = ({
  countdown,
  isOpponent = false,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-card border rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center space-y-4">
        <div className="flex justify-center">
          {isOpponent ? (
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <WifiOff className="w-8 h-8 animate-pulse" />
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold">
            {isOpponent ? 'Opponent Disconnected' : 'Reconnecting...'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isOpponent
              ? 'Waiting for opponent to reconnect to the game'
              : 'Connection lost. Auto-restoring your session...'}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                className="text-muted/30"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                className="text-primary"
                strokeWidth="3"
                strokeDasharray={`${(countdown / 60) * 100}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold font-mono">
              {countdown}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {isOpponent
              ? 'Opponent will forfeit if timer reaches 0'
              : 'Game ends if not reconnected in 60s'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReconnectingOverlay;
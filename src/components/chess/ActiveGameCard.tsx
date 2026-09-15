import React from 'react';
import { AlertCircle, Flag, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActiveGameCardProps {
  opponentName: string;
  opponentReg: string;
  timeControl: number;
  whiteTime: number;
  blackTime: number;
  playerColor: 'w' | 'b';
  onResume: () => void;
  onResign: () => void;
}

export const ActiveGameCard: React.FC<ActiveGameCardProps> = ({
  opponentName,
  opponentReg,
  timeControl,
  onResume,
  onResign,
}) => {
  return (
    <Card className="w-full bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 rounded-2xl shadow-md overflow-hidden">
      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Active Game in Progress</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium">
                {Math.floor(timeControl / 60)} min
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Playing vs <span className="font-medium text-foreground">{opponentName}</span> ({opponentReg}). Resign to start another game.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onResign}
            className="flex-1 sm:flex-none border-destructive/30 hover:bg-destructive/10 text-destructive text-xs font-semibold rounded-xl gap-1.5"
          >
            <Flag className="w-4 h-4" />
            Resign
          </Button>
          <Button
            onClick={onResume}
            className="flex-1 sm:flex-none text-xs font-semibold rounded-xl gap-1.5 shadow-sm"
          >
            <Play className="w-4 h-4" />
            Resume Game
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
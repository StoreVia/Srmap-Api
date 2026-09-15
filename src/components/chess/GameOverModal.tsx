import React from 'react';
import { Award, RotateCcw, Swords, Trophy, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GameOverModalProps {
  isOpen: boolean;
  result: 'white_win' | 'black_win' | 'draw' | null;
  reason: string;
  winReason?: string;
  playerColor: 'w' | 'b';
  opponentName: string;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  rematchRequested: boolean;
  rematchOfferedByOpponent: boolean;
  onAcceptRematch: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  result,
  winReason,
  playerColor,
  opponentName,
  onPlayAgain,
  onBackToLobby,
  rematchRequested,
  rematchOfferedByOpponent,
  onAcceptRematch,
}) => {
  if (!result) return null;

  const isDraw = result === 'draw';
  const isWinner =
    (result === 'white_win' && playerColor === 'w') ||
    (result === 'black_win' && playerColor === 'b');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onBackToLobby()}>
      <DialogContent className="w-full max-w-sm p-6 rounded-3xl text-center">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            {isDraw ? (
              <div className="p-4 rounded-3xl bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5">
                <Award className="w-12 h-12" />
              </div>
            ) : isWinner ? (
              <div className="p-4 rounded-3xl bg-emerald-500/10 text-emerald-500 ring-8 ring-emerald-500/5">
                <Trophy className="w-12 h-12" />
              </div>
            ) : (
              <div className="p-4 rounded-3xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
                <XCircle className="w-12 h-12" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold tracking-tight text-center">
              {isDraw ? 'Game Drawn' : isWinner ? 'Victory!' : 'Defeat'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium text-center">
              {winReason || (isDraw ? 'Draw by rule' : isWinner ? 'You won the match' : 'Opponent won')}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="pt-2">
          {rematchOfferedByOpponent ? (
            <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-2xl space-y-2">
              <p className="text-xs font-semibold text-primary">
                {opponentName} wants to play again!
              </p>
              <Button
                onClick={onAcceptRematch}
                className="w-full text-xs font-semibold rounded-xl"
              >
                Accept Rematch
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <Button
                onClick={onPlayAgain}
                disabled={rematchRequested}
                className="w-full flex items-center justify-center gap-2 py-5 text-xs font-semibold rounded-2xl"
              >
                <RotateCcw className="w-4 h-4" />
                {rematchRequested ? 'Waiting for opponent...' : `Play Again with ${opponentName}`}
              </Button>

              <Button
                variant="outline"
                onClick={onBackToLobby}
                className="w-full flex items-center justify-center gap-2 py-5 text-xs font-semibold rounded-2xl"
              >
                <Swords className="w-4 h-4" />
                Back to Lobby
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
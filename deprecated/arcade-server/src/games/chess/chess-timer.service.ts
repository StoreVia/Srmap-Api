import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { GameSession, PieceColor } from './chess.types';

export type TimeoutCallback = (session: GameSession, loserColor: PieceColor) => void;

@Injectable()
export class ChessTimerService implements OnModuleInit, OnModuleDestroy {
  private intervalRef: NodeJS.Timeout | null = null;
  private activeGames = new Map<string, GameSession>();
  private onTimeoutCb: TimeoutCallback | null = null;

  onModuleInit() {
    this.intervalRef = setInterval(() => {
      this.tick();
    }, 1000);
  }

  setTimeoutCallback(cb: TimeoutCallback) {
    this.onTimeoutCb = cb;
  }

  registerGame(session: GameSession) {
    this.activeGames.set(session.gameId, session);
  }

  unregisterGame(gameId: string) {
    this.activeGames.delete(gameId);
  }

  updatePlayerTime(session: GameSession) {
    const now = Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((now - session.lastMoveTimestamp) / 1000));
    if (elapsedSeconds > 0) {
      if (session.turn === 'w') {
        session.white.timeLeft = Math.max(0, session.white.timeLeft - elapsedSeconds);
      } else {
        session.black.timeLeft = Math.max(0, session.black.timeLeft - elapsedSeconds);
      }
      session.lastMoveTimestamp = now;
    }
  }

  private tick() {
    const now = Date.now();
    for (const [, session] of this.activeGames.entries()) {
      if (session.status !== 'active') {
        continue;
      }
      const elapsedSeconds = Math.max(0, Math.floor((now - session.lastMoveTimestamp) / 1000));
      if (elapsedSeconds <= 0) {
        continue;
      }

      if (session.turn === 'w') {
        const remaining = Math.max(0, session.white.timeLeft - elapsedSeconds);
        session.white.timeLeft = remaining;
        session.lastMoveTimestamp = now;
        if (remaining <= 0) {
          session.status = 'timeout';
          session.winner = 'b';
          session.winReason = 'White ran out of time';
          if (this.onTimeoutCb) {
            this.onTimeoutCb(session, 'w');
          }
        }
      } else {
        const remaining = Math.max(0, session.black.timeLeft - elapsedSeconds);
        session.black.timeLeft = remaining;
        session.lastMoveTimestamp = now;
        if (remaining <= 0) {
          session.status = 'timeout';
          session.winner = 'w';
          session.winReason = 'Black ran out of time';
          if (this.onTimeoutCb) {
            this.onTimeoutCb(session, 'b');
          }
        }
      }
    }
  }

  onModuleDestroy() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
    this.activeGames.clear();
  }
}

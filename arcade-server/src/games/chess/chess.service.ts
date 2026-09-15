import { Injectable, OnModuleInit } from '@nestjs/common';
import { Chess } from 'chess.js';
import { RedisService } from '../../redis/redis.service';
import { DbService } from '../../db/db.service';
import { ChessTimerService } from './chess-timer.service';
import {
  AllowedTimeControl,
  DISCONNECT_TIMEOUT_MS,
  VALID_TIME_CONTROLS,
} from '../../config/constants';
import {
  GamePlayer,
  GameSession,
  MoveAttempt,
  MoveRecord,
  PieceColor,
} from './chess.types';

export interface CreateGameParams {
  white: Omit<GamePlayer, 'color' | 'timeLeft' | 'isConnected'>;
  black: Omit<GamePlayer, 'color' | 'timeLeft' | 'isConnected'>;
  timeControl: AllowedTimeControl;
}

@Injectable()
export class ChessService implements OnModuleInit {
  private games = new Map<string, GameSession>();
  private userActiveGame = new Map<string, string>();
  private chessInstances = new Map<string, Chess>();

  constructor(
    private readonly redisService: RedisService,
    private readonly timerService: ChessTimerService,
    private readonly dbService: DbService,
  ) {}

  onModuleInit() {
    this.timerService.setTimeoutCallback((session) => {
      this.persistSession(session);
      this.cleanupActiveUser(session.white.regNumber);
      this.cleanupActiveUser(session.black.regNumber);
      this.cleanupActiveUser(session.white.userId);
      this.cleanupActiveUser(session.black.userId);
    });
  }

  createGame(params: CreateGameParams): GameSession {
    const timeControl = VALID_TIME_CONTROLS.includes(params.timeControl)
      ? params.timeControl
      : 600;

    const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const chess = new Chess();

    const whitePlayer: GamePlayer = {
      ...params.white,
      color: 'w',
      timeLeft: timeControl,
      isConnected: true,
    };

    const blackPlayer: GamePlayer = {
      ...params.black,
      color: 'b',
      timeLeft: timeControl,
      isConnected: true,
    };

    const session: GameSession = {
      gameId,
      white: whitePlayer,
      black: blackPlayer,
      timeControl,
      fen: chess.fen(),
      turn: 'w',
      status: 'active',
      moves: [],
      lastMoveTimestamp: Date.now(),
      createdAt: Date.now(),
    };

    this.games.set(gameId, session);
    this.chessInstances.set(gameId, chess);
    this.timerService.registerGame(session);

    this.setUserActiveGame(whitePlayer.regNumber, gameId);
    this.setUserActiveGame(whitePlayer.userId, gameId);
    this.setUserActiveGame(blackPlayer.regNumber, gameId);
    this.setUserActiveGame(blackPlayer.userId, gameId);

    this.persistSession(session);

    return session;
  }

  getGame(gameId: string): GameSession | undefined {
    return this.games.get(gameId);
  }

  getActiveGameForUser(userKey: string): GameSession | undefined {
    const gameId = this.userActiveGame.get(userKey.toUpperCase()) || this.userActiveGame.get(userKey);
    if (!gameId) return undefined;
    const game = this.games.get(gameId);
    if (game && game.status === 'active') {
      return game;
    }
    return undefined;
  }

  makeMove(gameId: string, playerKey: string, moveAttempt: MoveAttempt): { success: boolean; move?: MoveRecord; session?: GameSession; error?: string } {
    const session = this.games.get(gameId);
    if (!session || session.status !== 'active') {
      return { success: false, error: 'Game is not active' };
    }

    const playerColor = this.getPlayerColor(session, playerKey);
    if (!playerColor) {
      return { success: false, error: 'Not a player in this game' };
    }

    if (session.turn !== playerColor) {
      return { success: false, error: 'Not your turn' };
    }

    let chess = this.chessInstances.get(gameId);
    if (!chess) {
      chess = new Chess(session.fen);
      this.chessInstances.set(gameId, chess);
    }

    this.timerService.updatePlayerTime(session);

    if (playerColor === 'w' && session.white.timeLeft <= 0) {
      session.status = 'timeout';
      session.winner = 'b';
      session.winReason = 'White ran out of time';
      this.finishGame(session);
      return { success: false, error: 'Time expired', session };
    } else if (playerColor === 'b' && session.black.timeLeft <= 0) {
      session.status = 'timeout';
      session.winner = 'w';
      session.winReason = 'Black ran out of time';
      this.finishGame(session);
      return { success: false, error: 'Time expired', session };
    }

    try {
      const moveResult = chess.move({
        from: moveAttempt.from,
        to: moveAttempt.to,
        promotion: moveAttempt.promotion || 'q',
      });

      if (!moveResult) {
        return { success: false, error: 'Invalid move' };
      }

      const moveRecord: MoveRecord = {
        from: moveAttempt.from,
        to: moveAttempt.to,
        san: moveResult.san,
        fen: chess.fen(),
        promotion: moveAttempt.promotion,
        timestamp: Date.now(),
      };

      session.moves.push(moveRecord);
      session.fen = chess.fen();
      session.turn = chess.turn() as PieceColor;
      session.drawOfferedBy = null;

      if (chess.isCheckmate()) {
        session.status = 'checkmate';
        session.winner = playerColor;
        session.winReason = `Checkmate! ${playerColor === 'w' ? 'White' : 'Black'} wins`;
        this.finishGame(session);
      } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
        session.status = 'draw';
        session.winner = 'draw';
        session.winReason = chess.isStalemate()
          ? 'Stalemate'
          : chess.isThreefoldRepetition()
          ? 'Threefold repetition'
          : chess.isInsufficientMaterial()
          ? 'Insufficient material'
          : 'Draw';
        this.finishGame(session);
      }

      this.persistSession(session);
      return { success: true, move: moveRecord, session };
    } catch {
      return { success: false, error: 'Illegal move' };
    }
  }

  resign(gameId: string, playerKey: string): { success: boolean; session?: GameSession; error?: string } {
    const session = this.games.get(gameId);
    if (!session || session.status !== 'active') {
      return { success: false, error: 'Game is not active' };
    }

    const playerColor = this.getPlayerColor(session, playerKey);
    if (!playerColor) {
      return { success: false, error: 'Not a player in this game' };
    }

    session.status = 'resignation';
    session.winner = playerColor === 'w' ? 'b' : 'w';
    session.winReason = `${playerColor === 'w' ? 'White' : 'Black'} resigned`;

    this.finishGame(session);
    return { success: true, session };
  }

  offerDraw(gameId: string, playerKey: string): { success: boolean; session?: GameSession; error?: string } {
    const session = this.games.get(gameId);
    if (!session || session.status !== 'active') {
      return { success: false, error: 'Game is not active' };
    }

    const playerColor = this.getPlayerColor(session, playerKey);
    if (!playerColor) {
      return { success: false, error: 'Not a player in this game' };
    }

    if (session.drawOfferedBy === playerColor) {
      return { success: false, error: 'Draw already offered' };
    }

    session.drawOfferedBy = playerColor;
    this.persistSession(session);
    return { success: true, session };
  }

  respondDraw(gameId: string, playerKey: string, accept: boolean): { success: boolean; session?: GameSession; error?: string } {
    const session = this.games.get(gameId);
    if (!session || session.status !== 'active') {
      return { success: false, error: 'Game is not active' };
    }

    const playerColor = this.getPlayerColor(session, playerKey);
    if (!playerColor) {
      return { success: false, error: 'Not a player in this game' };
    }

    if (!session.drawOfferedBy || session.drawOfferedBy === playerColor) {
      return { success: false, error: 'No active draw offer for you' };
    }

    if (accept) {
      session.status = 'draw';
      session.winner = 'draw';
      session.winReason = 'Draw by mutual agreement';
      this.finishGame(session);
    } else {
      session.drawOfferedBy = null;
      this.persistSession(session);
    }

    return { success: true, session };
  }

  handleDisconnect(gameId: string, playerKey: string, onTimeout: () => void): GameSession | undefined {
    const session = this.games.get(gameId);
    if (!session || session.status !== 'active') return undefined;

    const color = this.getPlayerColor(session, playerKey);
    if (!color) return undefined;

    const player = color === 'w' ? session.white : session.black;
    player.isConnected = false;

    if (player.disconnectTimeout) {
      clearTimeout(player.disconnectTimeout);
    }

    player.disconnectTimeout = setTimeout(() => {
      if (session.status === 'active' && !player.isConnected) {
        session.status = 'abandonment';
        session.winner = color === 'w' ? 'b' : 'w';
        session.winReason = `${color === 'w' ? 'White' : 'Black'} disconnected for more than 60 seconds`;
        this.finishGame(session);
        onTimeout();
      }
    }, DISCONNECT_TIMEOUT_MS);

    this.persistSession(session);
    return session;
  }

  handleReconnect(gameId: string, playerKey: string): GameSession | undefined {
    const session = this.games.get(gameId);
    if (!session) return undefined;

    const color = this.getPlayerColor(session, playerKey);
    if (!color) return undefined;

    const player = color === 'w' ? session.white : session.black;
    player.isConnected = true;

    if (player.disconnectTimeout) {
      clearTimeout(player.disconnectTimeout);
      player.disconnectTimeout = null;
    }

    this.persistSession(session);
    return session;
  }

  getPlayerColor(session: GameSession, playerKey: string): PieceColor | null {
    const key = playerKey.toUpperCase();
    if (session.white.regNumber.toUpperCase() === key || session.white.userId === playerKey) {
      return 'w';
    }
    if (session.black.regNumber.toUpperCase() === key || session.black.userId === playerKey) {
      return 'b';
    }
    return null;
  }

  getOpponent(session: GameSession, playerKey: string): GamePlayer | null {
    const color = this.getPlayerColor(session, playerKey);
    if (!color) return null;
    return color === 'w' ? session.black : session.white;
  }

  private finishGame(session: GameSession) {
    this.timerService.unregisterGame(session.gameId);
    this.cleanupActiveUser(session.white.regNumber);
    this.cleanupActiveUser(session.white.userId);
    this.cleanupActiveUser(session.black.regNumber);
    this.cleanupActiveUser(session.black.userId);

    if (session.winner === 'w') {
      this.dbService.recordChessWin(
        session.timeControl,
        session.white.regNumber,
        session.white.username,
        session.white.name
      );
    } else if (session.winner === 'b') {
      this.dbService.recordChessWin(
        session.timeControl,
        session.black.regNumber,
        session.black.username,
        session.black.name
      );
    }

    this.persistSession(session);
  }

  private setUserActiveGame(key: string, gameId: string) {
    if (!key) return;
    this.userActiveGame.set(key.toUpperCase(), gameId);
    this.redisService.set(`user_active:${key.toUpperCase()}`, gameId, 86400);
  }

  private cleanupActiveUser(key: string) {
    if (!key) return;
    this.userActiveGame.delete(key.toUpperCase());
    this.redisService.del(`user_active:${key.toUpperCase()}`);
  }

  private persistSession(session: GameSession) {
    const cleanSession = {
      ...session,
      white: { ...session.white, disconnectTimeout: undefined },
      black: { ...session.black, disconnectTimeout: undefined },
    };
    this.redisService.set(`game:${session.gameId}`, JSON.stringify(cleanSession), 86400);
  }
}

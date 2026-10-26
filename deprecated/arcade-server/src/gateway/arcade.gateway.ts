import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { AuthService, AuthenticatedUser } from '../auth/auth.service';
import { ChessService } from '../games/chess/chess.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { ChatService } from '../chat/chat.service';
import { ChessTimerService } from '../games/chess/chess-timer.service';
import { DbService } from '../db/db.service';
import { TypingTestService } from '../games/typingtest/typingtest.service';
import {
  PING_INTERVAL_MS,
  VALID_TIME_CONTROLS,
} from '../config/constants';
import { GameSession, MoveAttempt } from '../games/chess/chess.types';

interface ExtendedSocket extends WebSocket {
  isAlive?: boolean;
  user?: AuthenticatedUser;
}

@WebSocketGateway({ path: '/arcade-ws' })
export class ArcadeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private userSockets = new Map<string, WebSocket>();

  constructor(
    private readonly authService: AuthService,
    private readonly chessService: ChessService,
    private readonly matchmakingService: MatchmakingService,
    private readonly chatService: ChatService,
    private readonly timerService: ChessTimerService,
    private readonly dbService: DbService,
    private readonly typingTestService: TypingTestService,
  ) {}

  afterInit() {
    this.timerService.setTimeoutCallback((session, loserColor) => {
      this.broadcastToGame(session.gameId, {
        type: 'game_over',
        payload: {
          result: loserColor === 'w' ? 'black_win' : 'white_win',
          reason: 'timeout',
          winner: session.winner,
          winReason: session.winReason,
          whiteTime: session.white.timeLeft,
          blackTime: session.black.timeLeft,
        },
      });
      this.broadcastLeaderboard();
    });

    setInterval(() => {
      this.heartbeatCheck();
    }, PING_INTERVAL_MS);
  }

  handleConnection(client: ExtendedSocket) {
    client.isAlive = true;
    client.on('pong', () => {
      client.isAlive = true;
    });

    client.on('message', (data: string) => {
      try {
        const parsed = JSON.parse(data.toString());
        this.handleClientMessage(client, parsed);
      } catch {}
    });
  }

  handleDisconnect(client: ExtendedSocket) {
    if (!client.user) return;
    const regNumber = client.user.regNumber;
    this.removeUserSocket(client.user, client);
    this.matchmakingService.dequeue(regNumber);

    const activeGame = this.chessService.getActiveGameForUser(regNumber);
    if (activeGame) {
      this.chessService.handleDisconnect(activeGame.gameId, regNumber, () => {
        this.broadcastToGame(activeGame.gameId, {
          type: 'game_over',
          payload: {
            result: activeGame.winner === 'w' ? 'white_win' : 'black_win',
            reason: 'abandonment',
            winner: activeGame.winner,
            winReason: activeGame.winReason,
          },
        });
        this.broadcastLeaderboard();
      });

      const opponent = this.chessService.getOpponent(activeGame, regNumber);
      if (opponent && opponent.isConnected) {
        this.sendToUser(opponent.regNumber, {
          type: 'opponent_disconnected',
          payload: { timeout: 60, timestamp: Date.now() },
        });
      }
    }
  }

  private handleClientMessage(client: ExtendedSocket, message: { type: string; payload?: any }) {
    const { type, payload } = message;

    if (type === 'pong') {
      client.isAlive = true;
      return;
    }

    if (type === 'auth') {
      this.handleAuth(client, payload?.token);
      return;
    }

    if (!client.user) {
      this.send(client, { type: 'error', payload: { message: 'Unauthorized' } });
      return;
    }

    switch (type) {
      case 'get_leaderboard':
        this.handleGetLeaderboard(client);
        break;
      case 'typing_start':
        this.handleTypingStart(client, payload?.difficulty);
        break;
      case 'typing_begin':
        this.handleTypingBegin(client, payload?.sessionId);
        break;
      case 'typing_submit':
        this.handleTypingSubmit(client, payload?.sessionId, payload?.typedText);
        break;
      case 'check_active_game':
        this.handleCheckActiveGame(client);
        break;
      case 'resume_game':
        this.handleResumeGame(client, payload?.gameId);
        break;
      case 'find_match':
        this.handleFindMatch(client, payload?.timeControl);
        break;
      case 'cancel_search':
        this.handleCancelSearch(client);
        break;
      case 'friend_challenge':
        this.handleFriendChallenge(client, payload?.friendRegNumber, payload?.timeControl);
        break;
      case 'accept_challenge':
        this.handleAcceptChallenge(client, payload?.challengeId);
        break;
      case 'decline_challenge':
        this.handleDeclineChallenge(client, payload?.challengeId);
        break;
      case 'move':
        this.handleMove(client, payload?.gameId, payload?.move);
        break;
      case 'chat_message':
        this.handleChatMessage(client, payload?.gameId, payload?.text);
        break;
      case 'resign':
        this.handleResign(client, payload?.gameId);
        break;
      case 'draw_offer':
        this.handleDrawOffer(client, payload?.gameId);
        break;
      case 'draw_accept':
        this.handleDrawRespond(client, payload?.gameId, true);
        break;
      case 'draw_decline':
        this.handleDrawRespond(client, payload?.gameId, false);
        break;
      case 'rematch_request':
        this.handleRematchRequest(client, payload?.gameId);
        break;
      case 'rematch_accept':
        this.handleRematchAccept(client, payload?.gameId);
        break;
      case 'rematch_decline':
        this.handleRematchDecline(client, payload?.gameId);
        break;
      default:
        break;
    }
  }

  private handleAuth(client: ExtendedSocket, token: string) {
    if (!token) {
      this.send(client, { type: 'auth_error', payload: { message: 'No token provided' } });
      return;
    }

    const user = this.authService.verifyToken(token);
    if (!user) {
      this.send(client, { type: 'auth_error', payload: { message: 'Invalid token' } });
      return;
    }

    client.user = user;
    this.registerUserSocket(user, client);

    this.send(client, {
      type: 'auth_success',
      payload: {
        user,
        leaderboard: this.dbService.getDailyLeaderboard(),
      },
    });

    const activeGame = this.chessService.getActiveGameForUser(user.regNumber);
    if (activeGame && activeGame.status === 'active') {
      this.chessService.handleReconnect(activeGame.gameId, user.regNumber);
      const opponent = this.chessService.getOpponent(activeGame, user.regNumber);
      if (opponent && opponent.isConnected) {
        this.sendToUser(opponent.regNumber, { type: 'opponent_reconnected' });
      }

      this.send(client, {
        type: 'active_game_detected',
        payload: this.buildGameSessionPayload(activeGame, user.regNumber),
      });
    }
  }

  private handleGetLeaderboard(client: ExtendedSocket) {
    this.send(client, {
      type: 'daily_leaderboard',
      payload: this.dbService.getDailyLeaderboard(),
    });
  }

  private handleTypingStart(client: ExtendedSocket, difficultyRaw: string) {
    const user = client.user!;
    const session = this.typingTestService.startSession(user, difficultyRaw);
    this.send(client, {
      type: 'typing_session_started',
      payload: {
        sessionId: session.sessionId,
        difficulty: session.difficulty,
        prompt: session.prompt,
        startTime: session.startTime,
      },
    });
  }

  private handleTypingBegin(client: ExtendedSocket, sessionId: string) {
    const user = client.user!;
    if (sessionId) {
      this.typingTestService.beginSession(user, sessionId);
    }
  }

  private handleTypingSubmit(client: ExtendedSocket, sessionId: string, typedText: string) {
    const user = client.user!;
    const result = this.typingTestService.validateAndSubmit(user, sessionId, typedText);

    this.send(client, {
      type: 'typing_result',
      payload: result,
    });

    if (result.valid) {
      this.broadcastLeaderboard();
    }
  }

  private handleCheckActiveGame(client: ExtendedSocket) {
    const user = client.user!;
    const activeGame = this.chessService.getActiveGameForUser(user.regNumber);
    if (activeGame && activeGame.status === 'active') {
      this.send(client, {
        type: 'active_game_status',
        payload: {
          hasActiveGame: true,
          game: this.buildGameSessionPayload(activeGame, user.regNumber),
        },
      });
    } else {
      this.send(client, {
        type: 'active_game_status',
        payload: { hasActiveGame: false },
      });
    }
  }

  private handleResumeGame(client: ExtendedSocket, gameId?: string) {
    const user = client.user!;
    const activeGame = gameId
      ? this.chessService.getGame(gameId)
      : this.chessService.getActiveGameForUser(user.regNumber);

    if (!activeGame || activeGame.status !== 'active') {
      this.send(client, { type: 'error', payload: { message: 'No active game found' } });
      return;
    }

    this.chessService.handleReconnect(activeGame.gameId, user.regNumber);
    const opponent = this.chessService.getOpponent(activeGame, user.regNumber);
    if (opponent && opponent.isConnected) {
      this.sendToUser(opponent.regNumber, { type: 'opponent_reconnected' });
    }

    this.send(client, {
      type: 'game_resumed',
      payload: this.buildGameSessionPayload(activeGame, user.regNumber),
    });
  }

  private handleFindMatch(client: ExtendedSocket, timeControlRaw: any) {
    const user = client.user!;
    const activeGame = this.chessService.getActiveGameForUser(user.regNumber);
    if (activeGame && activeGame.status === 'active') {
      this.send(client, {
        type: 'error',
        payload: { message: 'You already have an active game in progress. Resign it first to play another.' },
      });
      return;
    }

    const timeControl = VALID_TIME_CONTROLS.includes(timeControlRaw) ? timeControlRaw : 600;
    const result = this.matchmakingService.enqueue(user, timeControl, client);

    if (result.matchedWith) {
      const isUserWhite = Math.random() < 0.5;
      const opponentUser = result.matchedWith.user;
      const opponentWs = result.matchedWith.ws;

      const game = this.chessService.createGame({
        white: isUserWhite ? user : opponentUser,
        black: isUserWhite ? opponentUser : user,
        timeControl,
      });

      this.send(client, {
        type: 'matched',
        payload: this.buildGameSessionPayload(game, user.regNumber),
      });

      if (opponentWs.readyState === WebSocket.OPEN) {
        this.send(opponentWs, {
          type: 'matched',
          payload: this.buildGameSessionPayload(game, opponentUser.regNumber),
        });
      }
    } else {
      this.send(client, {
        type: 'searching',
        payload: { position: result.position, timeControl },
      });
    }
  }

  private handleCancelSearch(client: ExtendedSocket) {
    const user = client.user!;
    this.matchmakingService.dequeue(user.regNumber);
    this.send(client, { type: 'search_cancelled' });
  }

  private handleFriendChallenge(client: ExtendedSocket, friendRegNumberRaw: string, timeControlRaw: any) {
    const user = client.user!;
    if (!friendRegNumberRaw) {
      this.send(client, { type: 'error', payload: { message: 'Friend registration number is required' } });
      return;
    }

    const friendReg = friendRegNumberRaw.trim().toUpperCase();
    if (friendReg === user.regNumber.toUpperCase()) {
      this.send(client, { type: 'error', payload: { message: 'You cannot challenge yourself' } });
      return;
    }

    const activeGame = this.chessService.getActiveGameForUser(user.regNumber);
    if (activeGame && activeGame.status === 'active') {
      this.send(client, {
        type: 'error',
        payload: { message: 'You already have an active game. Resign it first.' },
      });
      return;
    }

    const friendWs = this.getUserSocket(friendReg);
    if (!friendWs || friendWs.readyState !== WebSocket.OPEN) {
      this.send(client, {
        type: 'friend_challenge_status',
        payload: {
          success: false,
          friendActive: false,
          message: "His/her websocket isn't active. Only request is sent.",
        },
      });
      return;
    }

    const timeControl = VALID_TIME_CONTROLS.includes(timeControlRaw) ? timeControlRaw : 600;
    const challenge = this.matchmakingService.createChallenge(user, friendReg, timeControl);

    this.send(client, {
      type: 'friend_challenge_status',
      payload: {
        success: true,
        friendActive: true,
        challengeId: challenge.challengeId,
        message: 'Challenge sent to online friend',
      },
    });

    this.send(friendWs, {
      type: 'incoming_friend_challenge',
      payload: {
        challengeId: challenge.challengeId,
        fromUser: user,
        timeControl,
      },
    });
  }

  private handleAcceptChallenge(client: ExtendedSocket, challengeId: string) {
    const user = client.user!;
    const challenge = this.matchmakingService.getChallenge(challengeId);
    if (!challenge) {
      this.send(client, { type: 'error', payload: { message: 'Challenge expired or not found' } });
      return;
    }

    if (challenge.toRegNumber.toUpperCase() !== user.regNumber.toUpperCase()) {
      this.send(client, { type: 'error', payload: { message: 'Not authorized for this challenge' } });
      return;
    }

    const myActive = this.chessService.getActiveGameForUser(user.regNumber);
    if (myActive && myActive.status === 'active') {
      this.send(client, { type: 'error', payload: { message: 'You are currently in an active game.' } });
      return;
    }

    const oppActive = this.chessService.getActiveGameForUser(challenge.fromUser.regNumber);
    if (oppActive && oppActive.status === 'active') {
      this.send(client, { type: 'error', payload: { message: 'Opponent is already in an active game.' } });
      return;
    }

    this.matchmakingService.removeChallenge(challengeId);

    const senderWs = this.getUserSocket(challenge.fromUser.regNumber);
    if (!senderWs || senderWs.readyState !== WebSocket.OPEN) {
      this.send(client, { type: 'error', payload: { message: 'Opponent disconnected' } });
      return;
    }

    const isAcceptorWhite = Math.random() < 0.5;
    const game = this.chessService.createGame({
      white: isAcceptorWhite ? user : challenge.fromUser,
      black: isAcceptorWhite ? challenge.fromUser : user,
      timeControl: challenge.timeControl,
    });

    this.send(client, {
      type: 'matched',
      payload: this.buildGameSessionPayload(game, user.regNumber),
    });

    this.send(senderWs, {
      type: 'matched',
      payload: this.buildGameSessionPayload(game, challenge.fromUser.regNumber),
    });
  }

  private handleDeclineChallenge(client: ExtendedSocket, challengeId: string) {
    const user = client.user!;
    const challenge = this.matchmakingService.getChallenge(challengeId);
    if (!challenge) return;

    this.matchmakingService.removeChallenge(challengeId);
    const senderWs = this.getUserSocket(challenge.fromUser.regNumber);
    if (senderWs && senderWs.readyState === WebSocket.OPEN) {
      this.send(senderWs, {
        type: 'challenge_declined',
        payload: { byUser: user.username },
      });
    }
  }

  private handleMove(client: ExtendedSocket, gameId: string, moveAttempt: MoveAttempt) {
    const user = client.user!;
    const result = this.chessService.makeMove(gameId, user.regNumber, moveAttempt);

    if (!result.success) {
      this.send(client, { type: 'error', payload: { message: result.error || 'Invalid move' } });
      return;
    }

    const session = result.session!;
    this.broadcastToGame(gameId, {
      type: 'move_made',
      payload: {
        gameId,
        move: result.move,
        fen: session.fen,
        turn: session.turn,
        whiteTime: session.white.timeLeft,
        blackTime: session.black.timeLeft,
        moves: session.moves,
      },
    });

    if (session.status !== 'active') {
      this.broadcastToGame(gameId, {
        type: 'game_over',
        payload: {
          result: session.winner === 'draw' ? 'draw' : session.winner === 'w' ? 'white_win' : 'black_win',
          reason: session.status,
          winner: session.winner,
          winReason: session.winReason,
        },
      });
      this.broadcastLeaderboard();
    }
  }

  private handleChatMessage(client: ExtendedSocket, gameId: string, text: string) {
    const user = client.user!;
    if (!text || !text.trim()) return;

    const session = this.chessService.getGame(gameId);
    if (!session) return;

    const msg = this.chatService.addMessage(gameId, user.regNumber, user.name || user.username, text.trim());
    this.broadcastToGame(gameId, {
      type: 'chat_message',
      payload: msg,
    });
  }

  private handleResign(client: ExtendedSocket, gameId: string) {
    const user = client.user!;
    const result = this.chessService.resign(gameId, user.regNumber);

    if (!result.success) {
      this.send(client, { type: 'error', payload: { message: result.error || 'Cannot resign' } });
      return;
    }

    const session = result.session!;
    this.broadcastToGame(gameId, {
      type: 'game_over',
      payload: {
        result: session.winner === 'w' ? 'white_win' : 'black_win',
        reason: 'resignation',
        winner: session.winner,
        winReason: session.winReason,
      },
    });
    this.broadcastLeaderboard();
  }

  private handleDrawOffer(client: ExtendedSocket, gameId: string) {
    const user = client.user!;
    const result = this.chessService.offerDraw(gameId, user.regNumber);
    if (!result.success) return;

    const session = result.session!;
    const opponent = this.chessService.getOpponent(session, user.regNumber);
    if (opponent) {
      this.sendToUser(opponent.regNumber, {
        type: 'draw_offered',
        payload: { fromUser: user.username },
      });
    }
  }

  private handleDrawRespond(client: ExtendedSocket, gameId: string, accept: boolean) {
    const user = client.user!;
    const result = this.chessService.respondDraw(gameId, user.regNumber, accept);
    if (!result.success) return;

    const session = result.session!;
    if (accept) {
      this.broadcastToGame(gameId, {
        type: 'game_over',
        payload: {
          result: 'draw',
          reason: 'draw',
          winner: 'draw',
          winReason: 'Draw agreed',
        },
      });
    } else {
      const opponent = this.chessService.getOpponent(session, user.regNumber);
      if (opponent) {
        this.sendToUser(opponent.regNumber, { type: 'draw_declined' });
      }
    }
  }

  private handleRematchRequest(client: ExtendedSocket, gameId: string) {
    const user = client.user!;
    const session = this.chessService.getGame(gameId);
    if (!session) return;

    session.rematchRequestedBy = user.regNumber;
    const opponent = this.chessService.getOpponent(session, user.regNumber);
    if (opponent) {
      this.sendToUser(opponent.regNumber, {
        type: 'rematch_requested',
        payload: { fromUser: user.username },
      });
    }
  }

  private handleRematchAccept(client: ExtendedSocket, gameId: string) {
    const user = client.user!;
    const session = this.chessService.getGame(gameId);
    if (!session) return;

    const opponent = this.chessService.getOpponent(session, user.regNumber);
    if (!opponent) return;

    const newGame = this.chessService.createGame({
      white: session.black,
      black: session.white,
      timeControl: session.timeControl,
    });

    this.sendToUser(user.regNumber, {
      type: 'matched',
      payload: this.buildGameSessionPayload(newGame, user.regNumber),
    });

    this.sendToUser(opponent.regNumber, {
      type: 'matched',
      payload: this.buildGameSessionPayload(newGame, opponent.regNumber),
    });
  }

  private handleRematchDecline(client: ExtendedSocket, gameId: string) {
    const user = client.user!;
    const session = this.chessService.getGame(gameId);
    if (!session) return;

    const opponent = this.chessService.getOpponent(session, user.regNumber);
    if (opponent) {
      this.sendToUser(opponent.regNumber, { type: 'rematch_declined' });
    }
  }

  private buildGameSessionPayload(session: GameSession, userReg: string) {
    const color = this.chessService.getPlayerColor(session, userReg);
    const opponent = this.chessService.getOpponent(session, userReg);
    const messages = this.chatService.getMessages(session.gameId);

    return {
      gameId: session.gameId,
      fen: session.fen,
      turn: session.turn,
      color,
      timeControl: session.timeControl,
      whiteTime: session.white.timeLeft,
      blackTime: session.black.timeLeft,
      status: session.status,
      moves: session.moves,
      opponent: opponent
        ? {
            regNumber: opponent.regNumber,
            username: opponent.username,
            name: opponent.name,
            color: opponent.color,
            isConnected: opponent.isConnected,
          }
        : null,
      messages,
      winner: session.winner,
      winReason: session.winReason,
      drawOfferedBy: session.drawOfferedBy,
    };
  }

  private broadcastToGame(gameId: string, message: { type: string; payload?: any }) {
    const session = this.chessService.getGame(gameId);
    if (!session) return;

    this.sendToUser(session.white.regNumber, message);
    this.sendToUser(session.black.regNumber, message);
  }

  private broadcastLeaderboard() {
    const data = this.dbService.getDailyLeaderboard();
    const payload = JSON.stringify({
      type: 'leaderboard_update',
      payload: data,
    });

    for (const ws of this.userSockets.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  private registerUserSocket(user: AuthenticatedUser, client: WebSocket) {
    const keys = [user.regNumber, user.username, user.userId].filter(Boolean);
    for (const key of keys) {
      const upper = key.toUpperCase();
      const existing = this.userSockets.get(upper);
      if (existing && existing !== client && existing.readyState === WebSocket.OPEN) {
        try {
          existing.terminate();
        } catch {}
      }
      this.userSockets.set(upper, client);
    }
  }

  private removeUserSocket(user: AuthenticatedUser, client: WebSocket) {
    const keys = [user.regNumber, user.username, user.userId].filter(Boolean);
    for (const key of keys) {
      const upper = key.toUpperCase();
      if (this.userSockets.get(upper) === client) {
        this.userSockets.delete(upper);
      }
    }
  }

  private getUserSocket(key: string): WebSocket | undefined {
    if (!key) return undefined;
    return this.userSockets.get(key.trim().toUpperCase());
  }

  private sendToUser(userKey: string, message: { type: string; payload?: any }) {
    const ws = this.getUserSocket(userKey);
    if (ws && ws.readyState === WebSocket.OPEN) {
      this.send(ws, message);
    }
  }

  private send(ws: WebSocket, message: { type: string; payload?: any }) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private heartbeatCheck() {
    for (const [reg, ws] of this.userSockets.entries()) {
      const extWs = ws as ExtendedSocket;
      if (!extWs.isAlive) {
        ws.terminate();
        this.userSockets.delete(reg);
        continue;
      }
      extWs.isAlive = false;
      this.send(ws, { type: 'ping' });
    }
  }
}
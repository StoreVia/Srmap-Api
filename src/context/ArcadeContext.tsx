'use client';
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useLocalStorageContext } from '@/context/LocalStorageContext';
import { ChatMsg } from '@/components/chess/ChessChat';
import { toast } from '@/hooks/utils/useToast';

export type SocketStatus =
  | 'idle'
  | 'connecting'
  | 'searching'
  | 'playing'
  | 'game_over'
  | 'reconnecting'
  | 'disconnected';

export interface MoveRecord {
  from: string;
  to: string;
  san: string;
  fen: string;
  promotion?: string;
  timestamp: number;
}

export interface OpponentInfo {
  regNumber: string;
  username: string;
  name: string;
  color: 'w' | 'b';
  isConnected: boolean;
}

export interface ActiveGameData {
  gameId: string;
  fen: string;
  turn: 'w' | 'b';
  color: 'w' | 'b';
  timeControl: number;
  whiteTime: number;
  blackTime: number;
  status: string;
  moves: MoveRecord[];
  opponent: OpponentInfo | null;
  winner?: 'w' | 'b' | 'draw';
  winReason?: string;
  drawOfferedBy?: 'w' | 'b' | null;
}

export interface IncomingChallenge {
  challengeId: string;
  fromUser: {
    regNumber: string;
    username: string;
    name?: string;
  };
  timeControl: number;
}

export interface DailyChessRecord {
  regNumber: string;
  username: string;
  name?: string;
  wins: number;
  timeControl: number;
}

export interface DailyTypingRecord {
  regNumber: string;
  username: string;
  name?: string;
  difficulty: string;
  wpm: number;
  accuracy: number;
  timeTaken: number;
  createdAt: number;
}

export interface DailyLeaderboardData {
  date: string;
  chess: {
    600: DailyChessRecord[];
    1200: DailyChessRecord[];
    1800: DailyChessRecord[];
  };
  typing: {
    easy: DailyTypingRecord[];
    medium: DailyTypingRecord[];
    hard: DailyTypingRecord[];
  };
}

export interface TypingSessionData {
  sessionId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  startTime: number;
}

export interface TypingResultData {
  valid: boolean;
  wpm: number;
  accuracy: number;
  timeTaken: number;
  difficulty: 'easy' | 'medium' | 'hard';
  message?: string;
}

export interface ArcadeState {
  status: SocketStatus;
  activeGame: ActiveGameData | null;
  cachedActiveGame: ActiveGameData | null;
  hasActiveGameInLobby: boolean;
  messages: ChatMsg[];
  viewingMoveIndex: number;
  searchPosition: number;
  selectedTimeControl: number;
  reconnectCountdown: number;
  opponentDisconnected: boolean;
  opponentDisconnectCountdown: number;
  friendChallengeStatus: string | null;
  isSendingFriendChallenge: boolean;
  incomingChallenge: IncomingChallenge | null;
  rematchRequested: boolean;
  rematchOfferedByOpponent: boolean;
  errorMessage: string | null;
  dailyLeaderboard: DailyLeaderboardData | null;
  typingSession: TypingSessionData | null;
  typingResult: TypingResultData | null;
  isSubmittingTyping: boolean;
}

export interface ArcadeContextType extends ArcadeState {
  displayFen: string;
  lastMove: { from: string; to: string } | null;
  arrowMove: { from: string; to: string } | null;
  fetchLeaderboard: () => void;
  startTypingTest: (difficulty: 'easy' | 'medium' | 'hard') => void;
  beginTypingTest: (sessionId: string) => void;
  submitTypingTest: (sessionId: string, typedText: string) => void;
  resetTypingTest: () => void;
  setSelectedTimeControl: (timeControl: number) => void;
  findMatch: (timeControl: number) => void;
  cancelSearch: () => void;
  sendFriendChallenge: (friendRegNumber: string, timeControl: number) => void;
  acceptFriendChallenge: (challengeId: string) => void;
  declineFriendChallenge: (challengeId: string) => void;
  resumeActiveGame: (gameId?: string) => void;
  makeMove: (from: string, to: string, promotion?: string) => void;
  sendMessage: (text: string) => void;
  resign: () => void;
  offerDraw: () => void;
  acceptDraw: () => void;
  declineDraw: () => void;
  requestRematch: () => void;
  acceptRematch: () => void;
  declineRematch: () => void;
  navigateMove: (index: number) => void;
  backToLobby: () => void;
  setFriendChallengeStatus: (status: string | null) => void;
  setErrorMessage: (msg: string | null) => void;
}

const getWsUrl = () => {
  if (typeof window === 'undefined') return 'ws://localhost:8081/arcade-ws';
  const isSecure = window.location.protocol === 'https:';
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'ws://localhost:8081/arcade-ws';
  }
  return `${isSecure ? 'wss:' : 'ws:'}//${window.location.host}/arcade-ws`;
};

class ArcadeSocketClient {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private listeners = new Set<() => void>();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private countdownInterval: NodeJS.Timeout | null = null;
  private oppDisconnectInterval: NodeJS.Timeout | null = null;
  private gameTimerInterval: NodeJS.Timeout | null = null;

  public state: ArcadeState = {
    status: 'connecting',
    activeGame: null,
    cachedActiveGame: null,
    hasActiveGameInLobby: false,
    messages: [],
    viewingMoveIndex: -1,
    searchPosition: 1,
    selectedTimeControl: 600,
    reconnectCountdown: 60,
    opponentDisconnected: false,
    opponentDisconnectCountdown: 60,
    friendChallengeStatus: null,
    isSendingFriendChallenge: false,
    incomingChallenge: null,
    rematchRequested: false,
    rematchOfferedByOpponent: false,
    errorMessage: null,
    dailyLeaderboard: null,
    typingSession: null,
    typingResult: null,
    isSubmittingTyping: false,
  };

  constructor() {
    this.startGameTimer();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
  }

  public init(token?: string) {
    if (token) {
      this.token = token;
    }
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.connect();
  }

  private connect() {
    if (!this.token || typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.state.status = this.state.status === 'playing' ? 'reconnecting' : 'connecting';
      this.notify();

      const url = getWsUrl();
      const ws = new WebSocket(url);
      this.ws = ws;

      ws.onopen = () => {
        if (this.ws === ws) {
          this.send('auth', { token: this.token });
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch {}
      };

      ws.onclose = () => {
        if (this.ws === ws) {
          this.ws = null;
          this.handleConnectionDrop();
        }
      };

      ws.onerror = () => {
        if (this.ws === ws) {
          this.ws = null;
          this.handleConnectionDrop();
        }
      };
    } catch {
      this.handleConnectionDrop();
    }
  }

  private handleConnectionDrop() {
    const wasPlaying = this.state.status === 'playing';
    this.state.status = wasPlaying ? 'reconnecting' : 'connecting';
    if (wasPlaying) {
      this.startReconnectTimer();
    }
    this.notify();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 2000);
  }

  private startReconnectTimer() {
    this.state.reconnectCountdown = 60;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.countdownInterval = setInterval(() => {
      if (this.state.reconnectCountdown <= 1) {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.state.status = 'disconnected';
        this.state.reconnectCountdown = 0;
        this.notify();
      } else {
        this.state.reconnectCountdown -= 1;
        this.notify();
      }
    }, 1000);
  }

  private startGameTimer() {
    if (this.gameTimerInterval) clearInterval(this.gameTimerInterval);
    this.gameTimerInterval = setInterval(() => {
      if (this.state.status === 'playing' && this.state.activeGame && this.state.activeGame.status === 'active') {
        const ag = this.state.activeGame;
        if (ag.turn === 'w') {
          ag.whiteTime = Math.max(0, ag.whiteTime - 1);
        } else {
          ag.blackTime = Math.max(0, ag.blackTime - 1);
        }
        this.notify();
      }
    }, 1000);
  }

  public send(type: string, payload?: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  private handleMessage(data: { type: string; payload?: any }) {
    const { type, payload } = data;

    switch (type) {
      case 'ping':
        this.send('pong');
        break;

      case 'auth_success':
        this.state.status = this.state.status === 'playing' ? 'playing' : 'idle';
        if (payload?.leaderboard) {
          this.state.dailyLeaderboard = payload.leaderboard;
        }
        this.send('check_active_game');
        this.notify();
        break;

      case 'daily_leaderboard':
      case 'leaderboard_update':
        this.state.dailyLeaderboard = payload;
        this.notify();
        break;

      case 'typing_session_started':
        this.state.typingSession = payload;
        this.state.typingResult = null;
        this.state.isSubmittingTyping = false;
        this.notify();
        break;

      case 'typing_result':
        this.state.isSubmittingTyping = false;
        this.state.typingResult = payload;
        if (payload.valid) {
          toast.success(`Completed! Speed: ${payload.wpm} WPM | Accuracy: ${payload.accuracy}%`);
        } else {
          toast.error(payload.message || 'Typing test submission failed');
        }
        this.notify();
        break;

      case 'active_game_status':
        if (payload?.hasActiveGame && payload?.game) {
          this.state.hasActiveGameInLobby = true;
          this.state.cachedActiveGame = payload.game;
        } else {
          this.state.hasActiveGameInLobby = false;
          this.state.cachedActiveGame = null;
        }
        this.notify();
        break;

      case 'active_game_detected':
      case 'game_resumed':
      case 'matched':
        this.state.activeGame = payload;
        this.state.messages = payload.messages || [];
        this.state.viewingMoveIndex = (payload.moves || []).length - 1;
        this.state.status = 'playing';
        this.state.hasActiveGameInLobby = false;
        this.state.opponentDisconnected = false;
        this.state.rematchRequested = false;
        this.state.rematchOfferedByOpponent = false;
        this.state.incomingChallenge = null;
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        if (this.oppDisconnectInterval) clearInterval(this.oppDisconnectInterval);
        this.notify();
        break;

      case 'searching':
        this.state.status = 'searching';
        this.state.searchPosition = payload.position || 1;
        this.notify();
        break;

      case 'search_cancelled':
        this.state.status = 'idle';
        this.notify();
        break;

      case 'friend_challenge_status':
        this.state.isSendingFriendChallenge = false;
        this.state.friendChallengeStatus = payload.message || (payload.success ? 'Challenge sent' : 'Challenge failed');
        if (payload.success) {
          toast.success(payload.message || 'Challenge sent to online friend');
        } else {
          toast.error(payload.message || "Friend's websocket isn't active");
        }
        this.notify();
        break;

      case 'incoming_friend_challenge':
        this.state.incomingChallenge = payload;
        this.notify();
        break;

      case 'challenge_declined':
        this.state.friendChallengeStatus = `Challenge was declined by ${payload.byUser}`;
        toast.info(`Challenge was declined by ${payload.byUser}`);
        this.notify();
        break;

      case 'move_made':
        if (this.state.activeGame) {
          this.state.activeGame = {
            ...this.state.activeGame,
            fen: payload.fen,
            turn: payload.turn,
            whiteTime: payload.whiteTime,
            blackTime: payload.blackTime,
            moves: payload.moves,
            drawOfferedBy: null,
          };
          this.state.viewingMoveIndex = payload.moves.length - 1;
          this.notify();
        }
        break;

      case 'chat_message':
        this.state.messages = [...this.state.messages, payload];
        this.notify();
        break;

      case 'game_over':
        if (this.state.activeGame) {
          this.state.activeGame = {
            ...this.state.activeGame,
            status: payload.reason,
            winner: payload.winner,
            winReason: payload.winReason,
            whiteTime: payload.whiteTime ?? this.state.activeGame.whiteTime,
            blackTime: payload.blackTime ?? this.state.activeGame.blackTime,
          };
          this.state.status = 'game_over';
          if (this.oppDisconnectInterval) clearInterval(this.oppDisconnectInterval);
          this.notify();
        }
        break;

      case 'opponent_disconnected':
        this.state.opponentDisconnected = true;
        this.state.opponentDisconnectCountdown = payload?.timeout || 60;
        if (this.oppDisconnectInterval) clearInterval(this.oppDisconnectInterval);
        this.oppDisconnectInterval = setInterval(() => {
          if (this.state.opponentDisconnectCountdown <= 1) {
            if (this.oppDisconnectInterval) clearInterval(this.oppDisconnectInterval);
            this.state.opponentDisconnectCountdown = 0;
            this.notify();
          } else {
            this.state.opponentDisconnectCountdown -= 1;
            this.notify();
          }
        }, 1000);
        this.notify();
        break;

      case 'opponent_reconnected':
        this.state.opponentDisconnected = false;
        if (this.oppDisconnectInterval) clearInterval(this.oppDisconnectInterval);
        toast.info('Opponent reconnected');
        this.notify();
        break;

      case 'draw_offered':
        if (this.state.activeGame) {
          this.state.activeGame.drawOfferedBy = this.state.activeGame.color === 'w' ? 'b' : 'w';
          toast.info('Opponent offered a draw');
          this.notify();
        }
        break;

      case 'draw_declined':
        if (this.state.activeGame) {
          this.state.activeGame.drawOfferedBy = null;
          toast.info('Draw offer was declined');
          this.notify();
        }
        break;

      case 'rematch_requested':
        this.state.rematchOfferedByOpponent = true;
        toast.info('Opponent requested a rematch');
        this.notify();
        break;

      case 'rematch_declined':
        this.state.rematchRequested = false;
        toast.info('Rematch was declined');
        this.notify();
        break;

      case 'error':
        this.state.errorMessage = payload?.message || 'An error occurred';
        toast.error(payload?.message || 'An error occurred');
        this.notify();
        break;

      default:
        break;
    }
  }

  public fetchLeaderboard() {
    this.send('get_leaderboard');
  }

  public startTypingTest(difficulty: 'easy' | 'medium' | 'hard') {
    this.send('typing_start', { difficulty });
  }

  public beginTypingTest(sessionId: string) {
    this.send('typing_begin', { sessionId });
  }

  public submitTypingTest(sessionId: string, typedText: string) {
    this.state.isSubmittingTyping = true;
    this.notify();
    this.send('typing_submit', { sessionId, typedText });
  }

  public resetTypingTest() {
    this.state.typingSession = null;
    this.state.typingResult = null;
    this.state.isSubmittingTyping = false;
    this.notify();
  }

  public setSelectedTimeControl(timeControl: number) {
    this.state.selectedTimeControl = timeControl;
    this.notify();
  }

  public findMatch(timeControl: number) {
    this.state.selectedTimeControl = timeControl;
    this.send('find_match', { timeControl });
  }

  public cancelSearch() {
    this.send('cancel_search');
    this.state.status = 'idle';
    this.notify();
  }

  public sendFriendChallenge(friendRegNumber: string, timeControl: number) {
    this.state.isSendingFriendChallenge = true;
    this.state.friendChallengeStatus = null;
    this.notify();
    this.send('friend_challenge', { friendRegNumber, timeControl });
  }

  public acceptFriendChallenge(challengeId: string) {
    this.send('accept_challenge', { challengeId });
    this.state.incomingChallenge = null;
    this.notify();
  }

  public declineFriendChallenge(challengeId: string) {
    this.send('decline_challenge', { challengeId });
    this.state.incomingChallenge = null;
    this.notify();
  }

  public resumeActiveGame(gameId?: string) {
    this.send('resume_game', { gameId });
  }

  public makeMove(from: string, to: string, promotion?: string) {
    if (!this.state.activeGame) return;
    this.send('move', { gameId: this.state.activeGame.gameId, move: { from, to, promotion } });
  }

  public sendMessage(text: string) {
    if (!this.state.activeGame) return;
    this.send('chat_message', { gameId: this.state.activeGame.gameId, text });
  }

  public resign() {
    const gameId = this.state.activeGame?.gameId || this.state.cachedActiveGame?.gameId;
    if (!gameId) return;
    this.send('resign', { gameId });
    this.state.hasActiveGameInLobby = false;
    this.state.cachedActiveGame = null;
    this.notify();
    if (this.state.status !== 'playing') {
      this.send('check_active_game');
    }
  }

  public offerDraw() {
    if (!this.state.activeGame) return;
    this.send('draw_offer', { gameId: this.state.activeGame.gameId });
  }

  public acceptDraw() {
    if (!this.state.activeGame) return;
    this.send('draw_accept', { gameId: this.state.activeGame.gameId });
    this.state.activeGame.drawOfferedBy = null;
    this.notify();
  }

  public declineDraw() {
    if (!this.state.activeGame) return;
    this.send('draw_decline', { gameId: this.state.activeGame.gameId });
    this.state.activeGame.drawOfferedBy = null;
    this.notify();
  }

  public requestRematch() {
    if (!this.state.activeGame) return;
    this.state.rematchRequested = true;
    this.notify();
    this.send('rematch_request', { gameId: this.state.activeGame.gameId });
  }

  public acceptRematch() {
    if (!this.state.activeGame) return;
    this.send('rematch_accept', { gameId: this.state.activeGame.gameId });
  }

  public declineRematch() {
    if (!this.state.activeGame) return;
    this.state.rematchOfferedByOpponent = false;
    this.notify();
    this.send('rematch_decline', { gameId: this.state.activeGame.gameId });
  }

  public navigateMove(index: number) {
    this.state.viewingMoveIndex = index;
    this.notify();
  }

  public backToLobby() {
    this.state.status = 'idle';
    this.state.activeGame = null;
    this.state.messages = [];
    this.send('check_active_game');
    this.notify();
  }

  public setFriendChallengeStatus(status: string | null) {
    this.state.friendChallengeStatus = status;
    this.notify();
  }

  public setErrorMessage(msg: string | null) {
    this.state.errorMessage = msg;
    this.notify();
  }
}

export const arcadeClient = new ArcadeSocketClient();

const ArcadeContext = createContext<ArcadeContextType | null>(null);

export function ArcadeProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useLocalStorageContext();
  const token = profile?.accessToken;
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = arcadeClient.subscribe(() => {
      setTick((t) => t + 1);
    });

    if (token) {
      arcadeClient.init(token);
    }

    return () => {
      unsubscribe();
    };
  }, [token]);

  const state = arcadeClient.state;

  const displayFen = useMemo(() => {
    if (!state.activeGame) return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    if (state.viewingMoveIndex === -1) {
      return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
    if (state.viewingMoveIndex >= 0 && state.viewingMoveIndex < state.activeGame.moves.length) {
      return state.activeGame.moves[state.viewingMoveIndex].fen;
    }
    return state.activeGame.fen;
  }, [state.activeGame, state.viewingMoveIndex]);

  const lastMove = useMemo(() => {
    if (!state.activeGame || !state.activeGame.moves || state.activeGame.moves.length === 0) return null;
    if (state.viewingMoveIndex >= 0 && state.viewingMoveIndex < state.activeGame.moves.length) {
      const m = state.activeGame.moves[state.viewingMoveIndex];
      return { from: m.from, to: m.to };
    }
    return null;
  }, [state.activeGame, state.viewingMoveIndex]);

  const arrowMove = useMemo(() => {
    if (!state.activeGame || !state.activeGame.moves || state.activeGame.moves.length === 0) return null;
    const isLivePosition = state.viewingMoveIndex === state.activeGame.moves.length - 1;
    if (!isLivePosition && state.viewingMoveIndex >= 0 && state.viewingMoveIndex < state.activeGame.moves.length) {
      const m = state.activeGame.moves[state.viewingMoveIndex];
      return { from: m.from, to: m.to };
    }
    return null;
  }, [state.activeGame, state.viewingMoveIndex]);

  const contextValue: ArcadeContextType = {
    ...state,
    displayFen,
    lastMove,
    arrowMove,
    fetchLeaderboard: () => arcadeClient.fetchLeaderboard(),
    startTypingTest: (d) => arcadeClient.startTypingTest(d),
    beginTypingTest: (s) => arcadeClient.beginTypingTest(s),
    submitTypingTest: (s, t) => arcadeClient.submitTypingTest(s, t),
    resetTypingTest: () => arcadeClient.resetTypingTest(),
    setSelectedTimeControl: (t) => arcadeClient.setSelectedTimeControl(t),
    findMatch: (t) => arcadeClient.findMatch(t),
    cancelSearch: () => arcadeClient.cancelSearch(),
    sendFriendChallenge: (f, t) => arcadeClient.sendFriendChallenge(f, t),
    acceptFriendChallenge: (c) => arcadeClient.acceptFriendChallenge(c),
    declineFriendChallenge: (c) => arcadeClient.declineFriendChallenge(c),
    resumeActiveGame: (g) => arcadeClient.resumeActiveGame(g),
    makeMove: (f, t, p) => arcadeClient.makeMove(f, t, p),
    sendMessage: (t) => arcadeClient.sendMessage(t),
    resign: () => arcadeClient.resign(),
    offerDraw: () => arcadeClient.offerDraw(),
    acceptDraw: () => arcadeClient.acceptDraw(),
    declineDraw: () => arcadeClient.declineDraw(),
    requestRematch: () => arcadeClient.requestRematch(),
    acceptRematch: () => arcadeClient.acceptRematch(),
    declineRematch: () => arcadeClient.declineRematch(),
    navigateMove: (i) => arcadeClient.navigateMove(i),
    backToLobby: () => arcadeClient.backToLobby(),
    setFriendChallengeStatus: (s) => arcadeClient.setFriendChallengeStatus(s),
    setErrorMessage: (m) => arcadeClient.setErrorMessage(m),
  };

  return <ArcadeContext.Provider value={contextValue}>{children}</ArcadeContext.Provider>;
}

export function useArcadeContext(): ArcadeContextType {
  const context = useContext(ArcadeContext);
  if (!context) {
    throw new Error('useArcadeContext must be used within an ArcadeProvider');
  }
  return context;
}

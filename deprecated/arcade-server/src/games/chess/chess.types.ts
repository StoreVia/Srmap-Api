import { AllowedTimeControl } from '../../config/constants';

export type PieceColor = 'w' | 'b';

export interface GamePlayer {
  userId: string;
  regNumber: string;
  username: string;
  name?: string;
  color: PieceColor;
  timeLeft: number;
  isConnected: boolean;
  disconnectTimeout?: NodeJS.Timeout | null;
}

export interface MoveRecord {
  from: string;
  to: string;
  san: string;
  fen: string;
  promotion?: string;
  timestamp: number;
}

export type GameStatus =
  | 'active'
  | 'checkmate'
  | 'timeout'
  | 'resignation'
  | 'draw'
  | 'abandonment';

export interface GameSession {
  gameId: string;
  white: GamePlayer;
  black: GamePlayer;
  timeControl: AllowedTimeControl;
  fen: string;
  turn: PieceColor;
  status: GameStatus;
  winner?: PieceColor | 'draw';
  winReason?: string;
  moves: MoveRecord[];
  lastMoveTimestamp: number;
  drawOfferedBy?: PieceColor | null;
  rematchRequestedBy?: string | null;
  createdAt: number;
}

export interface MoveAttempt {
  from: string;
  to: string;
  promotion?: string;
}
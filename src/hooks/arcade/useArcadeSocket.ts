'use client';

import { useArcadeContext } from '@/context/ArcadeContext';

export type {
  SocketStatus,
  MoveRecord,
  OpponentInfo,
  ActiveGameData,
  IncomingChallenge,
  DailyChessRecord,
  DailyTypingRecord,
  DailyLeaderboardData,
  TypingSessionData,
  TypingResultData,
  ArcadeContextType,
} from '@/context/ArcadeContext';

export const useArcadeSocket = useArcadeContext;
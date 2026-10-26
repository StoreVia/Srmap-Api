export type TypingDifficulty = 'easy' | 'medium' | 'hard';

export interface TypingSession {
  sessionId: string;
  regNumber: string;
  username: string;
  name?: string;
  difficulty: TypingDifficulty;
  prompt: string;
  startTime: number;
}

export interface TypingValidationResult {
  valid: boolean;
  wpm: number;
  accuracy: number;
  timeTaken: number;
  difficulty: TypingDifficulty;
  message?: string;
}
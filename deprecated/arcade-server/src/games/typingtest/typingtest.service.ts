import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/auth.service';
import { DbService } from '../../db/db.service';
import { generateTypingPrompt } from './typingtest.prompts';
import { TypingDifficulty, TypingSession, TypingValidationResult } from './typingtest.types';

@Injectable()
export class TypingTestService {
  private activeSessions = new Map<string, TypingSession>();

  constructor(private readonly dbService: DbService) {}

  public startSession(user: AuthenticatedUser, difficultyRaw: string): TypingSession {
    const validDifficulties: TypingDifficulty[] = ['easy', 'medium', 'hard'];
    const difficulty: TypingDifficulty = validDifficulties.includes(difficultyRaw as TypingDifficulty)
      ? (difficultyRaw as TypingDifficulty)
      : 'easy';

    const prompt = generateTypingPrompt(difficulty);
    const sessionId = `${user.regNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const session: TypingSession = {
      sessionId,
      regNumber: user.regNumber,
      username: user.username,
      name: user.name,
      difficulty,
      prompt,
      startTime: 0,
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  public beginSession(user: AuthenticatedUser, sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    if (session.regNumber.toUpperCase() !== user.regNumber.toUpperCase()) return false;

    if (session.startTime === 0) {
      session.startTime = Date.now();
    }
    return true;
  }

  public validateAndSubmit(
    user: AuthenticatedUser,
    sessionId: string,
    typedText: string
  ): TypingValidationResult {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return {
        valid: false,
        wpm: 0,
        accuracy: 0,
        timeTaken: 0,
        difficulty: 'easy',
        message: 'Invalid or expired typing session. Please start a new test.',
      };
    }

    if (session.regNumber.toUpperCase() !== user.regNumber.toUpperCase()) {
      return {
        valid: false,
        wpm: 0,
        accuracy: 0,
        timeTaken: 0,
        difficulty: session.difficulty,
        message: 'Session does not belong to the current user.',
      };
    }

    this.activeSessions.delete(sessionId);

    const now = Date.now();
    const effectiveStartTime = session.startTime > 0 ? session.startTime : now - 60000;
    const elapsedMs = now - effectiveStartTime;
    const elapsedSeconds = Math.max(1, Math.min(65, Math.round(elapsedMs / 1000)));
    const elapsedMinutes = Math.max(0.1, elapsedSeconds / 60);

    const target = session.prompt;
    const input = typedText || '';

    let correctChars = 0;
    const compareLength = Math.min(input.length, target.length);

    for (let i = 0; i < compareLength; i++) {
      if (input[i] === target[i]) {
        correctChars++;
      }
    }

    const accuracy = input.length > 0
      ? Math.max(0, Math.min(100, Math.round((correctChars / input.length) * 100)))
      : 0;

    const rawWpm = Math.round((correctChars / 5) / elapsedMinutes);
    const wpm = Math.max(0, rawWpm);

    const isTooFast = wpm > 250 || (input.length > 50 && elapsedMs < 5000);
    const isUnrealisticPacing = input.length > 20 && (elapsedMs / input.length) < 20;

    if (isTooFast || isUnrealisticPacing) {
      return {
        valid: false,
        wpm: 0,
        accuracy,
        timeTaken: elapsedSeconds,
        difficulty: session.difficulty,
        message: 'Submission flagged for abnormal typing speed or copy-paste injection.',
      };
    }

    if (accuracy >= 30 && wpm > 0) {
      this.dbService.recordTypingScore(
        session.difficulty,
        user.regNumber,
        user.username,
        user.name,
        wpm,
        accuracy,
        elapsedSeconds
      );
    }

    return {
      valid: true,
      wpm,
      accuracy,
      timeTaken: elapsedSeconds,
      difficulty: session.difficulty,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { AllowedTimeControl, TIME_CONTROLS } from '../config/constants';
import { AuthenticatedUser } from '../auth/auth.service';
import { FriendChallenge, QueuedPlayer } from './matchmaking.types';

@Injectable()
export class MatchmakingService {
  private queues = new Map<AllowedTimeControl, QueuedPlayer[]>();
  private pendingChallenges = new Map<string, FriendChallenge>();

  constructor() {
    this.queues.set(TIME_CONTROLS.TEN_MIN, []);
    this.queues.set(TIME_CONTROLS.TWENTY_MIN, []);
    this.queues.set(TIME_CONTROLS.THIRTY_MIN, []);
  }

  enqueue(user: AuthenticatedUser, timeControl: AllowedTimeControl, ws: WebSocket): { matchedWith?: QueuedPlayer; position: number } {
    this.dequeue(user.regNumber);

    const queue = this.queues.get(timeControl) || [];
    while (queue.length > 0) {
      const candidate = queue.shift()!;
      if (candidate.ws.readyState === WebSocket.OPEN && candidate.user.regNumber !== user.regNumber) {
        return { matchedWith: candidate, position: 0 };
      }
    }

    const queuedPlayer: QueuedPlayer = {
      user,
      timeControl,
      ws,
      joinedAt: Date.now(),
    };
    queue.push(queuedPlayer);
    this.queues.set(timeControl, queue);

    return { position: queue.length };
  }

  dequeue(regNumber: string): boolean {
    const reg = regNumber.toUpperCase();
    let removed = false;
    for (const [tc, list] of this.queues.entries()) {
      const filtered = list.filter((p) => p.user.regNumber.toUpperCase() !== reg);
      if (filtered.length !== list.length) {
        removed = true;
        this.queues.set(tc, filtered);
      }
    }
    return removed;
  }

  isUserQueued(regNumber: string): boolean {
    const reg = regNumber.toUpperCase();
    for (const list of this.queues.values()) {
      if (list.some((p) => p.user.regNumber.toUpperCase() === reg)) {
        return true;
      }
    }
    return false;
  }

  createChallenge(fromUser: AuthenticatedUser, toRegNumber: string, timeControl: AllowedTimeControl): FriendChallenge {
    const challengeId = `chal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const challenge: FriendChallenge = {
      challengeId,
      fromUser,
      toRegNumber: toRegNumber.toUpperCase(),
      timeControl,
      createdAt: Date.now(),
    };
    this.pendingChallenges.set(challengeId, challenge);
    return challenge;
  }

  getChallenge(challengeId: string): FriendChallenge | undefined {
    return this.pendingChallenges.get(challengeId);
  }

  findChallengeForRecipient(toRegNumber: string): FriendChallenge | undefined {
    const reg = toRegNumber.toUpperCase();
    for (const challenge of this.pendingChallenges.values()) {
      if (challenge.toRegNumber === reg) {
        return challenge;
      }
    }
    return undefined;
  }

  removeChallenge(challengeId: string): void {
    this.pendingChallenges.delete(challengeId);
  }
}
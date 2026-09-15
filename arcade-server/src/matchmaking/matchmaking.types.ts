import { WebSocket } from 'ws';
import { AllowedTimeControl } from '../config/constants';
import { AuthenticatedUser } from '../auth/auth.service';

export interface QueuedPlayer {
  user: AuthenticatedUser;
  timeControl: AllowedTimeControl;
  ws: WebSocket;
  joinedAt: number;
}

export interface FriendChallenge {
  challengeId: string;
  fromUser: AuthenticatedUser;
  toRegNumber: string;
  timeControl: AllowedTimeControl;
  createdAt: number;
}
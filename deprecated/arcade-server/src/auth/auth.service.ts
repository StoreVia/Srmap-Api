import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  userId: string;
  regNumber: string;
  username: string;
  name?: string;
}

@Injectable()
export class AuthService {
  private accessSecret = process.env.ACCESS_SECRET || 'eLjAIbZEs01Zxn4aMy5cTDqSbjktM2fl9MRM41p2nBE';

  verifyToken(token: string): AuthenticatedUser | null {
    try {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const decoded = jwt.verify(cleanToken, this.accessSecret) as Record<string, any>;
      const rawUser = decoded.username || decoded.regNumber || decoded.sub || decoded.id || '';
      const regNumber = String(rawUser).trim().toUpperCase();
      const userId = String(decoded.id || decoded.userId || decoded.sub || regNumber).trim();
      const username = String(decoded.username || decoded.name || regNumber || 'Player').trim();
      const name = String(decoded.name || username).trim();

      if (!regNumber && !userId) {
        return null;
      }

      return {
        userId,
        regNumber,
        username,
        name,
      };
    } catch {
      return null;
    }
  }
}
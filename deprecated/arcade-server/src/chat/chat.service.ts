import { Injectable } from '@nestjs/common';
import { ChatMessage } from './chat.types';

@Injectable()
export class ChatService {
  private messages = new Map<string, ChatMessage[]>();

  addMessage(gameId: string, senderReg: string, senderName: string, text: string): ChatMessage {
    const list = this.messages.get(gameId) || [];
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      gameId,
      senderReg,
      senderName,
      text,
      timestamp: Date.now(),
    };
    list.push(message);
    if (list.length > 100) {
      list.shift();
    }
    this.messages.set(gameId, list);
    return message;
  }

  getMessages(gameId: string): ChatMessage[] {
    return this.messages.get(gameId) || [];
  }

  clearMessages(gameId: string): void {
    this.messages.delete(gameId);
  }
}
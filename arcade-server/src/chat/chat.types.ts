export interface ChatMessage {
  id: string;
  gameId: string;
  senderReg: string;
  senderName: string;
  text: string;
  timestamp: number;
}
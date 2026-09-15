import React, { useEffect, useRef, useState } from 'react';
import { Send, Smile } from 'lucide-react';

export interface ChatMsg {
  id: string;
  senderReg: string;
  senderName: string;
  text: string;
  timestamp: number;
}

interface ChessChatProps {
  messages: ChatMsg[];
  onSendMessage: (text: string) => void;
  currentUserReg: string;
}

const COMMON_EMOJIS = ['😀', '😂', '🔥', '👍', '♟', '⚔️', '👑', '🤝', '😮', '👏', '❤️', '😎', '🎉', '🤯', '💀', '👀'];

export const ChessChat: React.FC<ChessChatProps> = ({
  messages,
  onSendMessage,
  currentUserReg,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    setShowEmojiPicker(false);
  };

  const addEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  return (
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-sm border rounded-2xl shadow-sm overflow-hidden w-full">
      <div className="px-3.5 py-2.5 border-b flex items-center justify-between">
        <span className="font-semibold text-xs sm:text-sm">Game Chat</span>
        <span className="text-[10px] sm:text-xs text-muted-foreground">{messages.length} msgs</span>
      </div>

      <div ref={scrollRef} className="flex-1 p-2.5 sm:p-3 overflow-y-auto space-y-2 min-h-[120px] max-h-[190px] sm:max-h-[250px]">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground italic py-4">
            No messages yet. Say hello or send an emoji!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderReg.toUpperCase() === currentUserReg.toUpperCase();
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[9px] sm:text-[10px] text-muted-foreground px-1 mb-0.5">
                  {isMe ? 'You' : msg.senderName}
                </div>
                <div
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl text-xs max-w-[88%] break-words ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-tr-xs'
                      : 'bg-muted rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showEmojiPicker && (
        <div className="p-1.5 border-t bg-muted/40 grid grid-cols-8 gap-1 animate-in fade-in zoom-in-95">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="text-base sm:text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-muted"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-2 border-t flex items-center gap-1.5 w-full">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className={`p-1.5 sm:p-2 rounded-lg hover:bg-muted transition text-muted-foreground shrink-0 ${
            showEmojiPicker ? 'text-primary bg-muted' : ''
          }`}
          title="Emojis"
        >
          <Smile className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 min-w-0 bg-muted/50 border rounded-lg px-2.5 sm:px-3 py-1.5 text-[16px] sm:text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 sm:p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 transition shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
import React from "react";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  message: string;
  conversationId: string | undefined;
  handleTyping: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isSocketReady?: boolean;
}

export default function ChatInput({
  message,
  conversationId,
  handleTyping,
  handleSendMessage,
  isSocketReady = true,
}: ChatInputProps) {
  return (
    <div className="p-4 sm:p-6 bg-white shrink-0 border-t border-slate-100">
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-4"
      >
        <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Paperclip size={20} />
        </button>

        <div className="flex-1 bg-[#F8FAFC] rounded-xl flex items-center px-4 py-3">
          <input
            type="text"
            placeholder={isSocketReady ? "Type your message..." : "Connecting..."}
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[15px] text-slate-700 placeholder:text-slate-400"
            value={message}
            onChange={handleTyping}
            disabled={!conversationId || !isSocketReady}
          />
        </div>

        <button
          type="submit"
          disabled={!message.trim() || !conversationId || !isSocketReady}
          className={`p-3.5 rounded-xl flex items-center justify-center transition-all ${
            message.trim() && conversationId && isSocketReady
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
              : "bg-slate-50 text-slate-300"
          }`}
        >
          <Send size={18} className="ml-0.5" />
        </button>
      </form>
    </div>
  );
}

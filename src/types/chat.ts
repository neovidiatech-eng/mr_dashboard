// types/chat.ts
export interface Message {
  id: string;
  conversationId: string;
  tempId?: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  status?: "sending" | "sent" | "failed";
}

export interface TypingPayload {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

export interface OnlineStatus {
  userId: string;
  status: "online" | "offline";
}

export interface Conversation {
    id: string;
    teacher: {
        id: string;
        user_id: string;
        name: string;
    };
    student: {
        id: string;
        user_id: string;
        name: string;
    };
    lastMessage?: {
        content: string;
        createdAt: string;
    };
}
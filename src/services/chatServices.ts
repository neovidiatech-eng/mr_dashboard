import api from "../lib/axios";
import { Conversation, Message } from "../types/chat";

export const getConversations = async (): Promise<{ conversations: Conversation[] }> => {
    const response = await api.get('/chat/conversations/');
    return response.data;
}
export const createConversation = async (data: {
    teacherId: string;
    studentId: string;
}): Promise<Conversation> => {
    const res = await api.post("/chat/conversations", data);
    return res.data.data;
};

export const sendMessage = async (data: {
  conversationId: string;
  content: string;
  type?: string;
}): Promise<Message> => {
  const res = await api.post(`/chat/messages`, data);
  return res.data.data;
};


export const getConversationMessages = async (
  conversationId: string,
  page = 1,
  limit = 50
): Promise<{
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}> => {
  const res = await api.get(
    `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
  );

  return res.data.data;
};
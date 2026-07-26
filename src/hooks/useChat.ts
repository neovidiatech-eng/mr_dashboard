import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { getSocket, connectSocket } from "../lib/socket";
import { setMessages, addMessage, setTyping, setOnlineStatus } from "../store/chatSlice";
import { Message, TypingPayload } from "../types/chat";

export const useChatSocket = (conversationId?: string ) => {
  const dispatch = useDispatch();

  const socket = useMemo(() => {
    let s = getSocket();
    if (!s) {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        s = connectSocket(token);
      }
    }
    return s;
  }, []);

  // NOTE: user:status is handled globally in socket.ts — no duplicate listener here

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("conversation:open", { conversationId });

    const onHistory = (data: any) => {
      dispatch(
        setMessages({
          conversationId: data.conversationId,
          messages: data.messages,
        })
      );
    };

    const onNewMessage = (message: Message) => {
      dispatch(addMessage(message));
    };

    const onTyping = (data: TypingPayload) => {
      dispatch(setTyping(data));
    };

    const onMessagesRead = (data: any) => {
      // If we receive a read receipt, the user is definitely online
      console.log("📨 [Handshake] User is online via read receipt:", data.userId);
      dispatch(setOnlineStatus({ userId: data.userId, status: "online" }));
    };

    socket.on("messages:history", onHistory);
    socket.on("message:new", onNewMessage);
    socket.on("typing:update", onTyping);
    socket.on("messages:read", onMessagesRead);

    // Handshake: emit message:read to let the other person know we are online
    socket.emit("message:read", { conversationId });

    return () => {
      socket.off("messages:history", onHistory);
      socket.off("message:new", onNewMessage);
      socket.off("typing:update", onTyping);
      socket.off("messages:read", onMessagesRead);
    };
  }, [socket, conversationId, dispatch]);

  return socket;
};


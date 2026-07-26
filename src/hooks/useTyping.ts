import { useRef } from "react";
import { Socket } from "socket.io-client";

export const useTyping = (socket: Socket | null, conversationId: string | undefined) => {
  const typingTimeout = useRef<NodeJS.Timeout>();
  const isCurrentlyTyping = useRef(false);

  const emitTyping = () => {
    if (!socket || !conversationId) return;

    // Only emit start if we haven't already
    if (!isCurrentlyTyping.current) {
      isCurrentlyTyping.current = true;
      socket.emit("typing:start", { conversationId });
    }

    // Clear existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeout.current = setTimeout(() => {
      if (isCurrentlyTyping.current) {
        socket.emit("typing:stop", { conversationId });
        isCurrentlyTyping.current = false;
      }
    }, 3000);
  };

  return emitTyping;
};
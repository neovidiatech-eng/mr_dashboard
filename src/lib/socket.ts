
import { io, Socket } from "socket.io-client";
import { baseURL } from "../consts";
import { store } from "../store/store";
import { setOnlineStatus, resetChatState } from "../store/chatSlice";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (!socket) {
    socket = io(baseURL, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket Connected! ID:", socket?.id);
    });

    // Listen to everything for debugging
    socket.onAny((event, ...args) => {
      console.log(`📡 [Global Socket Log] ${event}:`, args);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket Disconnected! Reason:", reason);
    });

    // On reconnect, re-request online statuses so UI doesn't show stale data
    socket.io.on("reconnect", () => {
      console.log("🔄 Socket Reconnected — re-requesting online statuses");
      socket?.emit("user:requestOnlineStatuses");
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Socket Connection Error:", error.message);
    });

    // Single global listener for online status (no duplicates)
    socket.on("user:status", (data) => {
      console.log("👤 [Global Status] Received:", data);
      store.dispatch(setOnlineStatus(data));
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
  store.dispatch(resetChatState());
};
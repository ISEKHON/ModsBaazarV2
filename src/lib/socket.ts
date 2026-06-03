import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./api";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let socket: Socket | null = null;

/** Connect to Socket.IO server with JWT auth */
export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const token = getAccessToken();
  if (!token) {
    console.warn("[Socket] No access token, skipping connection");
    return socket as any;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
  });

  return socket;
}

/** Disconnect and cleanup */
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

/** Get current socket instance */
export function getSocket(): Socket | null {
  return socket;
}

/** Subscribe to a socket event — returns unsubscribe function */
export function onSocketEvent<T = any>(
  event: string,
  handler: (data: T) => void
): () => void {
  if (!socket) {
    connectSocket();
  }
  if (!socket) {
    console.warn(`[Socket] Not connected, cannot listen for "${event}"`);
    return () => {};
  }
  socket.on(event, handler);
  return () => {
    socket?.off(event, handler);
  };
}

/** Emit a socket event */
export function emitSocketEvent(event: string, data?: any) {
  if (!socket?.connected) {
    console.warn(`[Socket] Not connected, cannot emit "${event}"`);
    return;
  }
  socket.emit(event, data);
}

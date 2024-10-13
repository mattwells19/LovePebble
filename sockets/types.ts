import type { UserSocket } from "./mod.ts";

/**
 * {userId}-{roomCode}
 */
export type UserSocketId = `${string}-${string}`;

export interface WebSocketEventHandlers<WebSocketMessage = unknown> {
  onOpen?: (userSocket: UserSocket) => void;
  onClose?: (userSocket: UserSocket) => void;
  onMessage?: (userSocket: UserSocket, event: WebSocketMessage) => void;
}

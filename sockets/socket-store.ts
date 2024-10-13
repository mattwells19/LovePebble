import type { UserSocketId, WebSocketEventHandlers } from "./types.ts";
import { UserSocket } from "./user-socket.ts";

export class SocketStore<WebSocketMessage = unknown> {
  #socketEventHandlers: WebSocketEventHandlers<WebSocketMessage>;
  #sockets: Map<UserSocketId, UserSocket>;

  constructor(socketEventHandlers: WebSocketEventHandlers<WebSocketMessage>) {
    this.#socketEventHandlers = socketEventHandlers;
    this.#sockets = new Map<UserSocketId, UserSocket>();
  }

  add(socket: WebSocket, roomCode: string, userId?: string): void {
    const newUserSocket = new UserSocket(socket, this.#socketEventHandlers, roomCode, userId);
    const prevUserSocket = this.#sockets.get(newUserSocket.id);

    if (prevUserSocket && prevUserSocket.socket.readyState === WebSocket.OPEN) {
      prevUserSocket.socket.close();
    }

    this.#sockets.set(newUserSocket.id, newUserSocket);
  }

  delete(socketId: UserSocketId): boolean {
    return this.#sockets.delete(socketId);
  }

  has(socketId: UserSocketId): boolean {
    return this.#sockets.has(socketId);
  }

  get(socketId: UserSocketId): UserSocket | null;
  get(userId: string, roomCode: string): UserSocket | null;
  get(a: UserSocketId | string, roomCode?: string): UserSocket | null {
    if (!roomCode) {
      return this.#sockets.get(a as UserSocketId) ?? null;
    }
    return this.#sockets.get(`${a}-${roomCode}`) ?? null;
  }
}

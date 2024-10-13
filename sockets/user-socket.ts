import type { UserSocketId, WebSocketEventHandlers } from "./types.ts";
import { decode, encode } from "msgpack";

export class UserSocket<WebSocketMessage = unknown> {
  #roomCode: string;
  #userId: string;
  #socket: WebSocket;

  constructor(
    socket: WebSocket,
    socketEventHandlers: WebSocketEventHandlers<WebSocketMessage>,
    roomCode: string,
    userId?: string,
  ) {
    this.#socket = socket;
    this.#roomCode = roomCode;
    this.#userId = userId ?? crypto.randomUUID();

    const { onOpen, onClose, onMessage } = socketEventHandlers;

    if (onOpen) {
      this.#socket.addEventListener("open", () => onOpen(this));
    }
    if (onClose) {
      this.#socket.addEventListener("close", () => onClose(this));
    }
    if (onMessage) {
      this.#socket.addEventListener("message", (evt) => onMessage(this, decode(evt.data) as WebSocketMessage));
    }
  }

  get id(): UserSocketId {
    return `${this.#userId}-${this.#roomCode}`;
  }

  get roomCode(): string {
    return this.#roomCode;
  }

  get userId(): string {
    return this.#userId;
  }

  get socket(): WebSocket {
    return this.#socket;
  }

  send(evtData: unknown | "PONG"): void {
    const payload = encode(evtData);

    if (this.#socket.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
    }
  }
}

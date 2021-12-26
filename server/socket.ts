import { WebSocketClient, WebSocketServer } from "https://deno.land/x/websocket@v0.1.3/mod.ts";
import { SocketIncoming } from "./socket.types.ts";
import { PlayerId } from "./types.ts";

const sockets = new Map<PlayerId, WebSocketClient>();

export function registerSocketHandlers(port: number) {
  const webSocketServer = new WebSocketServer(port);

  webSocketServer.on(SocketIncoming.Connection, (socket: WebSocketClient) => {
    const newPlayerId = crypto.randomUUID();
    sockets.set(newPlayerId, socket);

    socket.on(SocketIncoming.PlayCard, () => {});
  });
}

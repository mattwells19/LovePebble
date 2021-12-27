import { SocketIncoming } from "./socket.types.ts";
import { PlayerId } from "./types.ts";

const sockets = new Map<PlayerId, WebSocket>();

interface SocketMessage {
  type: SocketIncoming;
}

export function registerSocketHandlers(socket: WebSocket) {
  socket.onopen = () => {
    const newPlayerId = crypto.randomUUID();
    sockets.set(newPlayerId, socket);
    console.log("connected");
  };

  socket.onmessage = (msg: MessageEvent<string>) => {
    const data: SocketMessage = JSON.parse(msg.data);

    switch (data.type) {
      case SocketIncoming.PlayCard:
        break;
      case SocketIncoming.SelectCard:
        break;
      case SocketIncoming.SelectPlayer:
        break;
      case SocketIncoming.SubmitSelection:
        break;
      case SocketIncoming.AcknowledgeAction:
        break;
    }
  };
}

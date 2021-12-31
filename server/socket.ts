import { SocketIncoming, SocketMessage, SocketOutgoing } from "./socket.types.ts";
import { Player, PlayerId } from "./types.ts";
import { removePlayerFromRoom, Rooms } from "./rooms.ts";

export const sockets = new Map<PlayerId, WebSocket>();

export function registerSocketHandlers(socket: WebSocket) {
  const playerId: PlayerId = crypto.randomUUID();
  let roomId: string | null = null;

  socket.onopen = () => {
    sockets.set(playerId, socket);
    sendToSocket<string>({ type: SocketOutgoing.Connected, data: playerId });
  };

  socket.onclose = () => {
    sockets.delete(playerId);

    if (roomId) {
      removePlayerFromRoom(roomId, playerId);
      roomId = null;
    }
  };

  socket.onmessage = (msg: MessageEvent<string>) => {
    const data: SocketMessage = JSON.parse(msg.data);

    switch (data.type) {
      case SocketIncoming.Join: {
        const { roomCode, playerName } = data;

        const room = Rooms.get(roomCode);
        if (!room) {
          throw new Error(`No room exists with the code ${roomCode}.`);
        }

        if (roomId) {
          removePlayerFromRoom(roomId, playerId);
        }
        roomId = roomCode;

        // add the new player to the room
        const newPlayer: Player = {
          cards: [],
          gameScore: 0,
          handmaidProtected: false,
          name: playerName,
          outOfRound: false,
        };
        room.players.set(playerId, newPlayer);

        const updatedPlayerList = Array.from(room.players, ([playerId, playerDetails]) => [playerId, playerDetails]);
        sendMessageToRoom<(PlayerId | Player)[][]>(roomCode, {
          type: SocketOutgoing.PlayerUpdate,
          data: updatedPlayerList,
        });
        break;
      }
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

  function sendToSocket<TData>(data: { type: SocketOutgoing; data: TData }) {
    socket.send(JSON.stringify(data));
  }
}

function sendMessageToRoom<TData>(roomCode: string, data: { type: SocketOutgoing; data: TData }) {
  const room = Rooms.get(roomCode);
  if (!room) {
    throw new Error(`No room exists with the code ${roomCode}.`);
  }

  const allPlayerIds = Array.from(room.players.keys());

  const allPlayerSockets: Array<WebSocket> = allPlayerIds
    .map((playerId) => sockets.get(playerId))
    .filter((playerSocket): playerSocket is WebSocket => Boolean(playerSocket));

  allPlayerSockets.forEach((playerSocket) => {
    playerSocket.send(JSON.stringify(data));
  });
}

import { SocketIncoming, SocketMessage, SocketOutgoing } from "../types/socket.types.ts";
import { Player, PlayerId } from "../types/types.ts";
import { removePlayerFromRoom } from "../services/rooms.ts";
import { Sockets } from "../repositories/Sockets.ts";
import { Rooms } from "../repositories/Rooms.ts";

export function registerSocketHandlers(socket: WebSocket) {
  const playerId: PlayerId = crypto.randomUUID();
  let roomId: string | null = null;

  socket.onopen = () => {
    Sockets.set(playerId, socket);
    sendToSocket<string>({ type: SocketOutgoing.Connected, data: playerId });
  };

  socket.onclose = () => {
    Sockets.delete(playerId);

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
    .map((playerId) => Sockets.get(playerId))
    .filter((playerSocket): playerSocket is WebSocket => Boolean(playerSocket));

  allPlayerSockets.forEach((playerSocket) => {
    playerSocket.send(JSON.stringify(data));
  });
}

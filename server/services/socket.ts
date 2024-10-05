import type { SocketIncoming, SocketMessage, SocketOutgoing } from "../types/socket.types.ts";
import type { Player, PlayerId, RoomData, RoomDataGameNotStarted } from "../types/types.ts";
import { createRoomWithCode, removePlayerFromRoom } from "../services/rooms.ts";
import { Sockets } from "../repositories/Sockets.ts";
import { Rooms } from "../repositories/Rooms.ts";
import * as socketActions from "./socketActions.ts";
import * as cardActionHandlers from "./card-action-handlers.ts";

const gameIsStarted = (room: RoomData | RoomDataGameNotStarted): room is RoomData => room.game.started;

export interface SocketData {
  playerId: PlayerId;
  roomId: string | null;
}

export function registerSocketHandlers(socket: WebSocket) {
  const socketData: SocketData = {
    playerId: crypto.randomUUID(),
    roomId: null,
  };

  socket.onopen = () => {
    Sockets.set(socketData.playerId, socket);
    sendToSocket<string>({ type: SocketOutgoing.Connected, data: socketData.playerId });
  };

  socket.onclose = () => {
    Sockets.delete(socketData.playerId);

    if (socketData.roomId) {
      removePlayerFromRoom(socketData.roomId, socketData.playerId);

      const room = Rooms.get(socketData.roomId);
      if (room) {
        sendMessageToRoom<[PlayerId, Player][]>(socketData.roomId, {
          type: SocketOutgoing.PlayerUpdate,
          data: Array.from(room.players),
        });
      }

      socketData.roomId = null;
    }
  };

  socket.onmessage = (msg: MessageEvent<string>) => {
    const data: SocketMessage = JSON.parse(msg.data);

    switch (data.type) {
      case SocketIncoming.Join: {
        const { roomCode, playerName } = data;

        const room = Rooms.get(roomCode) ?? createRoomWithCode(roomCode);
        if (socketData.roomId) {
          removePlayerFromRoom(socketData.roomId, socketData.playerId);
        }
        socketData.roomId = roomCode;

        const joinResult = socketActions.join(socketData, room, playerName);
        sendMessageToRoom(roomCode, joinResult);
        break;
      }
      case SocketIncoming.StartGame: {
        const roomCode = socketData.roomId ?? "";
        const room = Rooms.get(roomCode);
        if (!room) {
          throw new Error(`Room does not exist ${socketData.roomId}.`);
        }

        if (gameIsStarted(room)) break;

        const startGameResult = socketActions.startGame(roomCode, room as RoomDataGameNotStarted);
        sendMessageToRoom(roomCode, { type: SocketOutgoing.GameUpdate, data: startGameResult });
        break;
      }
      case SocketIncoming.PlayCard: {
        const roomCode = socketData.roomId ?? "";
        const room = Rooms.get(roomCode);
        if (!room) {
          throw new Error(`Room does not exist ${socketData.roomId}.`);
        }

        if (!gameIsStarted(room)) break;

        const cardPlayedEvent = socketActions.handlePlayCard(roomCode, room, data.cardPlayed);
        sendMessageToRoom(roomCode, { type: SocketOutgoing.GameUpdate, data: cardPlayedEvent });
        break;
      }
      case SocketIncoming.SelectCard: {
        const roomCode = socketData.roomId ?? "";
        const room = Rooms.get(roomCode);
        if (!room) {
          throw new Error(`Room does not exist ${socketData.roomId}.`);
        }

        if (!gameIsStarted(room)) break;

        const playerSelectedEvent = socketActions.handleSelectCard(roomCode, room, data.cardPlayed);
        if (playerSelectedEvent) {
          sendMessageToRoom(roomCode, {
            type: SocketOutgoing.GameUpdate,
            data: playerSelectedEvent,
          });
        }
        break;
      }
      case SocketIncoming.SelectPlayer: {
        const roomCode = socketData.roomId ?? "";
        const room = Rooms.get(roomCode);
        if (!room) {
          throw new Error(`Room does not exist ${socketData.roomId}.`);
        }

        if (!gameIsStarted(room)) break;

        const playerSelectedEvent = socketActions.handleSelectPlayer(roomCode, room, data.playerSelected);
        if (playerSelectedEvent) {
          sendMessageToRoom(roomCode, {
            type: SocketOutgoing.GameUpdate,
            data: playerSelectedEvent,
          });
        }
        break;
      }
      case SocketIncoming.SubmitSelection: {
        const roomCode = socketData.roomId ?? "";
        const room = Rooms.get(roomCode);
        if (!room) {
          throw new Error(`Room does not exist ${socketData.roomId}.`);
        }

        if (!gameIsStarted(room)) break;

        // switch(room.game.cardPlayed) {
        //   case Card.Guard
        // }
        break;
      }
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

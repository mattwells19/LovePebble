import { decode, encode } from "@msgpack/msgpack";
import { SocketIncoming, type SocketMessage, SocketOutgoing } from "../types/socket.types.ts";
import type { Player, PlayerId } from "../types/types.ts";
import { createRoomWithCode, removePlayerFromRoom } from "../services/rooms.ts";
import { Sockets } from "../repositories/Sockets.ts";
import { Rooms } from "../repositories/Rooms.ts";
import * as socketActions from "./socketActions.ts";

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

  socket.onmessage = (msg: MessageEvent<Uint8Array>) => {
    const data = decode(msg.data) as SocketMessage;

    try {
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

          if (room.gameStarted) break;

          const startGameResult = socketActions.startGame(roomCode, room);
          sendMessageToRoom(roomCode, { type: SocketOutgoing.GameUpdate, data: startGameResult });
          break;
        }
        case SocketIncoming.StartRound: {
          const roomCode = socketData.roomId ?? "";
          const room = Rooms.get(roomCode);
          if (!room) {
            throw new Error(`Room does not exist ${socketData.roomId}.`);
          }

          if (!room.gameStarted || room.round !== null) break;

          const startRoundResult = socketActions.startRound(roomCode, room);
          sendMessageToRoom(roomCode, { type: SocketOutgoing.GameUpdate, data: startRoundResult });
          break;
        }
        case SocketIncoming.PlayCard: {
          const roomCode = socketData.roomId ?? "";
          const room = Rooms.get(roomCode);
          if (!room) {
            throw new Error(`Room does not exist ${socketData.roomId}.`);
          }

          if (!room.round) break;

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

          if (!room.round) break;

          const playerSelectedEvent = socketActions.handleSelectCard(roomCode, room, data.cardSelected);
          sendMessageToRoom(roomCode, {
            type: SocketOutgoing.GameUpdate,
            data: playerSelectedEvent,
          });
          break;
        }
        case SocketIncoming.SelectPlayer: {
          const roomCode = socketData.roomId ?? "";
          const room = Rooms.get(roomCode);
          if (!room) {
            throw new Error(`Room does not exist ${socketData.roomId}.`);
          }

          if (!room.round) break;

          const playerSelectedEvent = socketActions.handleSelectPlayer(roomCode, room, data.playerSelected);
          sendMessageToRoom(roomCode, {
            type: SocketOutgoing.GameUpdate,
            data: playerSelectedEvent,
          });
          break;
        }
        case SocketIncoming.SubmitSelection: {
          const roomCode = socketData.roomId ?? "";
          const room = Rooms.get(roomCode);
          if (!room) {
            throw new Error(`Room does not exist ${socketData.roomId}.`);
          }

          if (!room.round) break;

          const submittedSelectionResult = socketActions.handleSubmitSelection(roomCode, room);
          sendMessageToRoom(roomCode, {
            type: SocketOutgoing.GameUpdate,
            data: submittedSelectionResult,
          });
          break;
        }
        case SocketIncoming.AcknowledgeAction: {
          const roomCode = socketData.roomId ?? "";
          const room = Rooms.get(roomCode);
          if (!room) {
            throw new Error(`Room does not exist ${socketData.roomId}.`);
          }

          if (!room.round) break;

          const acknowledgedActionResult = socketActions.handleAcknowledgeAction(roomCode, room);
          sendMessageToRoom(roomCode, {
            type: SocketOutgoing.GameUpdate,
            data: acknowledgedActionResult,
          });
          break;
        }
        case SocketIncoming.ResetGame: {
          const roomCode = socketData.roomId ?? "";
          const room = Rooms.get(roomCode);
          if (!room) {
            throw new Error(`Room does not exist ${socketData.roomId}.`);
          }

          if (!room.gameStarted || !!room.round) break;

          const resetGameResult = socketActions.handleResetGame(roomCode, room);
          sendMessageToRoom(roomCode, {
            type: SocketOutgoing.GameUpdate,
            data: resetGameResult,
          });
          break;
        }
      }
    } catch (err) {
      console.error(err);
      console.info("Socket data", data);
      console.info("Room data", Rooms.get(socketData.roomId ?? ""));
    }
  };

  function sendToSocket<TData>(data: { type: SocketOutgoing; data: TData }) {
    socket.send(encode(data));
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

  const serializedData = encode(data);
  allPlayerSockets.forEach((playerSocket) => {
    playerSocket.send(serializedData);
  });
}

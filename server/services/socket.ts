import { OutgoingGameStateUpdate, SocketIncoming, SocketMessage, SocketOutgoing } from "../types/socket.types.ts";
import { Player, PlayerId } from "../types/types.ts";
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

    // give users a chance to reconnect to a room with a 5 second delay
    setTimeout(() => {
      if (socketData.roomId) {
        removePlayerFromRoom(socketData.roomId, socketData.playerId);
        sendGameUpdateToRoom();
        socketData.roomId = null;
      }
    }, 5000);
  };

  socket.onmessage = (msg: MessageEvent<string>) => {
    const data: SocketMessage = JSON.parse(msg.data);

    switch (data.type) {
      case SocketIncoming.Join: {
        const { roomCode, playerName, oldPlayerId } = data;

        const room = Rooms.get(roomCode) ?? createRoomWithCode(roomCode);
        if (socketData.roomId) {
          removePlayerFromRoom(socketData.roomId, socketData.playerId);
        }
        socketData.roomId = roomCode;

        const roomUpdate = socketActions.join(socketData.playerId, room, playerName, oldPlayerId);
        Rooms.set(roomCode, roomUpdate);
        sendGameUpdateToRoom();
        break;
      }
      case SocketIncoming.StartGame: {
        const roomCode = socketData.roomId ?? "";
        const room = Rooms.get(roomCode);
        if (!room) {
          throw new Error(`Room does not exist ${socketData.roomId}.`);
        }

        const roomUpdate = socketActions.startGame(room);
        Rooms.set(roomCode, roomUpdate);
        sendGameUpdateToRoom();
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

  function sendGameUpdateToRoom() {
    if (!socketData.roomId) {
      return;
    }

    const roomData = Rooms.get(socketData.roomId);
    if (!roomData) {
      return;
    }

    /**
     * We don't want to show which cards are auto-removed from the deck when a game starts.
     * 2 players removes 3 cards; > 2 players removes 1 so replace the auto removed cards
     * with "Hidden".
     */
    const discardWithHidden = roomData.discard.map((card, index) => {
      if (
        roomData.game.started &&
        ((roomData.game.roomSizeOnStart === 2 && index < 3) || (roomData.game.roomSizeOnStart > 2 && index === 0))
      ) {
        return "Hidden";
      } else {
        return card;
      }
    });

    const allPlayerIds: Array<PlayerId> = Array.from(roomData.players.keys());

    allPlayerIds.forEach((playerId) => {
      const socket = Sockets.get(playerId as PlayerId);

      if (socket) {
        const playerPayload: [PlayerId, Player][] = Array.from(roomData.players, ([pId, playerData]) => {
          if (playerId === pId) {
            return [pId, playerData];
          } else {
            return [
              pId,
              {
                ...playerData,
                cards: [],
              },
            ];
          }
        });

        socket.send(
          JSON.stringify({
            type: SocketOutgoing.GameUpdate,
            data: {
              deckCount: roomData.deck.length,
              // reverse array so that most recent discard is on top (index 0)
              discard: discardWithHidden.reverse(),
              game: roomData.game,
              players: playerPayload,
            } as OutgoingGameStateUpdate,
          }),
        );
      }
    });
  }
}

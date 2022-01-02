import { SocketIncoming, SocketMessage, SocketOutgoing } from "../types/socket.types.ts";
import { Card, GameData, Player, PlayerId, RoomData, StandardDeck } from "../types/types.ts";
import { createRoomWithCode, removePlayerFromRoom } from "../services/rooms.ts";
import { Sockets } from "../repositories/Sockets.ts";
import { Rooms } from "../repositories/Rooms.ts";
import { shuffle } from "../utils.ts";
import { OutgoingGameStateUpdate } from "../types/socket.types.ts";

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

      const room = Rooms.get(roomId);
      if (room) {
        const updatedPlayerList = Array.from(room.players, ([playerId, playerDetails]) => [playerId, playerDetails]);
        sendMessageToRoom<(PlayerId | Player)[][]>(roomId, {
          type: SocketOutgoing.PlayerUpdate,
          data: updatedPlayerList,
        });
      }

      roomId = null;
    }
  };

  socket.onmessage = (msg: MessageEvent<string>) => {
    const data: SocketMessage = JSON.parse(msg.data);

    switch (data.type) {
      case SocketIncoming.Join: {
        const { roomCode, playerName } = data;

        const room = Rooms.get(roomCode) ?? createRoomWithCode(roomCode);
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
          data: updatedPlayerList,
          type: SocketOutgoing.PlayerUpdate,
        });
        break;
      }
      case SocketIncoming.StartGame: {
        const roomCode = roomId ?? "";
        const room = Rooms.get(roomCode);
        if (!room) {
          throw new Error(`Room does not exist ${roomId}.`);
        }

        const updatedGameState: GameData = {
          cardPlayed: null,
          details: null,
          playerTurnId: room.players.keys().next().value,
          started: true,
          winningSpyPlayerId: null,
        };

        const deck = shuffle(StandardDeck);

        switch (room.players.size) {
          case 2:
            deck.pop();
            deck.pop();
          /* falls through */
          default:
            deck.pop();
        }

        const updatedPlayers = new Map(room.players);
        updatedPlayers.forEach((player: Player, id: PlayerId) => {
          const playerHand: Array<Card> = [];

          // guaranteed to have enough cards so that pop is always safe here
          playerHand.push(deck.pop()!);
          if (updatedGameState.playerTurnId === id) playerHand.push(deck.pop()!);

          room.players.set(id, {
            ...player,
            cards: playerHand,
          });
        });

        const updatedRoomData: RoomData = {
          deck,
          game: updatedGameState,
          players: updatedPlayers,
        };

        Rooms.set(roomCode, updatedRoomData);

        const updatedPlayerList = Array.from(room.players, ([playerId, playerDetails]) => [playerId, playerDetails]);
        const gameData: OutgoingGameStateUpdate = {
          deckCount: deck.length,
          game: updatedGameState,
          players: updatedPlayerList,
        };
        sendMessageToRoom<OutgoingGameStateUpdate>(roomCode, { data: gameData, type: SocketOutgoing.GameUpdate });
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

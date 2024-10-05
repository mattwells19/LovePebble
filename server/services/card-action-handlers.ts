import { Rooms } from "../repositories/Rooms.ts";
import type { OutgoingGameStateUpdate } from "../types/socket.types.ts";
import type { Player, PlayerId, RoomData } from "../types/types.ts";

const getNextPlayerTurnId = (roomData: RoomData): string => {
  const playerIds = Array.from(roomData.players.keys());
  const currentPlayerTurnIdIndex = playerIds.indexOf(roomData.game.playerTurnId);
  const newPlayerTurnId =
    currentPlayerTurnIdIndex === playerIds.length - 1 ? playerIds.at(0) : playerIds.at(currentPlayerTurnIdIndex + 1);
  if (!newPlayerTurnId) {
    throw new Error("Idk whose turn is next");
  }
  return newPlayerTurnId;
};

const updatePlayer = (roomData: RoomData, playerId: PlayerId, playerUpdates: Partial<Player>): RoomData["players"] => {
  const player = roomData.players.get(playerId);
  if (!player) throw new Error("Where'd this player go??");

  const updatedPlayers = new Map(roomData.players);

  updatedPlayers.set(playerId, {
    ...player,
    ...playerUpdates,
  } satisfies Player);

  return updatedPlayers;
};

export function handlePlayedSpy(roomCode: string, roomData: RoomData): OutgoingGameStateUpdate {
  const playingPlayer = roomData.players.get(roomData.game.playerTurnId);

  const updatedPlayers = updatePlayer(roomData, roomData.game.playerTurnId, { playedSpy: true });

  const newGameState: OutgoingGameStateUpdate = {
    deckCount: roomData.deck.length,
    discard: roomData.discard,
    players: Array.from(updatedPlayers),
    game: {
      ...roomData.game,
      playerTurnId: getNextPlayerTurnId(roomData),
      cardPlayed: null,
      details: null,
      lastMoveDescription: `${playingPlayer?.name} played the Spy!`,
    },
  };

  const updatedRoomData: RoomData = {
    ...roomData,
    game: newGameState.game,
  };
  Rooms.set(roomCode, updatedRoomData);

  return newGameState;
}

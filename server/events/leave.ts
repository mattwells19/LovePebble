import { getNextPlayerTurnId } from "../events/utils/mod.ts";
import type { PlayerId, RoomData } from "../types/types.ts";
import { resetGame } from "./reset-game.ts";

export function leave(roomCode: string, roomData: RoomData, playerLeavingId: PlayerId): RoomData | undefined {
  const playerLeaving = roomData.players.get(playerLeavingId);
  if (!playerLeaving) {
    throw new Error(`Player with ID ${playerLeavingId} wasn't in ${roomCode}.`);
  }

  const newDiscard = [...roomData.discard, ...playerLeaving.cards];

  const newPlayers = new Map(roomData.players);
  newPlayers.delete(playerLeavingId);

  if (newPlayers.size === 0) {
    return;
  }

  const updatedRoomData: RoomData = {
    ...roomData,
    players: newPlayers,
    discard: newDiscard,
    roundLog: [...roomData.roundLog, `${playerLeaving.name} left the room.`],
  };

  if (newPlayers.size === 1) {
    return resetGame(roomCode, updatedRoomData);
  }

  if (updatedRoomData.round) {
    if (updatedRoomData.round.playerTurnId === playerLeavingId) {
      const newPlayerTurnId = getNextPlayerTurnId(roomData.players, updatedRoomData.round.playerTurnId);
      return {
        ...updatedRoomData,
        round: {
          playerTurnId: newPlayerTurnId,
          cardPlayed: null,
          details: null,
        },
      };
    }

    if (
      updatedRoomData.round.details && "chosenPlayerId" in updatedRoomData.round.details &&
      updatedRoomData.round.details.chosenPlayerId === playerLeavingId
    ) {
      updatedRoomData.round.details.chosenPlayerId = null;
      return updatedRoomData;
    }
  }

  return updatedRoomData;
}

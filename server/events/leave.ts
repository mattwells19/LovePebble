import { getNextPlayerTurnId } from "../events/utils/mod.ts";
import type { Card, PlayerId, RoomData } from "../types/types.ts";
import { resetGame } from "./reset-game.ts";

export function leave(roomCode: string, roomData: RoomData, playerLeavingId: PlayerId): RoomData | undefined {
  let playerLeavingName: string | null = null;
  let newDiscard: Array<Card> = [...roomData.discard];

  const newPlayers = new Map(roomData.players);
  if (newPlayers.has(playerLeavingId)) {
    const playerLeaving = newPlayers.get(playerLeavingId)!;
    playerLeavingName = playerLeaving.name;
    newDiscard = [...newDiscard, ...playerLeaving.cards];

    newPlayers.delete(playerLeavingId);
  }

  if (newPlayers.size === 0) {
    return;
  }

  const newSpectators = new Map(roomData.spectators);
  if (newSpectators.has(playerLeavingId)) {
    playerLeavingName = newSpectators.get(playerLeavingId)!;
    newSpectators.delete(playerLeavingId);
  }

  const updatedRoomData: RoomData = {
    ...roomData,
    players: newPlayers,
    spectators: newSpectators,
    discard: newDiscard,
    roundLog: [...roomData.roundLog, `${playerLeavingName} left the room.`],
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

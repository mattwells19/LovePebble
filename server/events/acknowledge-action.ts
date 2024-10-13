import { Rooms } from "../repositories/Rooms.ts";
import { knockPlayerOutOfRound, prepRoomDataForNextTurn } from "./utils/mod.ts";
import { Card, type RoomData } from "../types/types.ts";

export function acknowledgeAction(roomCode: string, roomData: RoomData): RoomData {
  let updatedRoomData = roomData;

  if (roomData.round?.cardPlayed === Card.Baron && roomData.round.details.winningPlayerId !== null) {
    const losingplayerId = roomData.round.details.winningPlayerId === roomData.round.playerTurnId
      ? roomData.round.details.chosenPlayerId
      : roomData.round.playerTurnId;
    if (!losingplayerId) {
      throw new Error(`No losing player to update ?`);
    }

    updatedRoomData = knockPlayerOutOfRound(roomData, losingplayerId);
  }

  const roomDataForNextTurn = prepRoomDataForNextTurn(updatedRoomData);
  Rooms.set(roomCode, roomDataForNextTurn);

  return roomDataForNextTurn;
}

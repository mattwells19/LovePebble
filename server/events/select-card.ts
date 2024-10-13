import { Rooms } from "../repositories/Rooms.ts";
import { Card, type RoomData, type RoundData } from "../types/types.ts";

export function selectCard(roomCode: string, roomData: RoomData, cardSelected: Card): RoomData {
  if (!roomData.round?.details || "card" in roomData.round?.details === false) {
    throw new Error(`Did not ask for card selection.`);
  }

  let newRoundData: RoundData | null = null;

  if (roomData.round.cardPlayed === Card.Guard) {
    newRoundData = {
      ...roomData.round,
      details: {
        ...roomData.round.details,
        card: cardSelected,
      },
    };
  } else if (roomData.round.cardPlayed === Card.Chancellor) {
    newRoundData = {
      ...roomData.round,
      details: {
        ...roomData.round.details,
        card: cardSelected,
      },
    };
  } else {
    throw new Error(`Card selection wasn't for a Guard or Chancellor.`);
  }

  const updatedRoomData: RoomData = {
    ...roomData,
    round: newRoundData,
  };

  Rooms.set(roomCode, updatedRoomData);

  return updatedRoomData;
}

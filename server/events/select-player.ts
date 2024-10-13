import { Rooms } from "../repositories/Rooms.ts";
import type { PlayerId, RoomData } from "../types/types.ts";

export function selectPlayer(roomCode: string, roomData: RoomData, playerSelected: PlayerId): RoomData {
  const roomDataCopy = structuredClone(roomData);

  if (!roomDataCopy.round?.details || "chosenPlayerId" in roomDataCopy.round.details === false) {
    throw new Error(`Details didn't ask for chosenPlayerId. Game state: ${JSON.stringify(roomDataCopy.round)}`);
  }

  roomDataCopy.round.details.chosenPlayerId = playerSelected;
  Rooms.set(roomCode, roomDataCopy);

  return roomDataCopy;
}

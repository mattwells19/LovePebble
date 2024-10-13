import type { RoomData } from "../types/types.ts";
import { startRound } from "./start-round.ts";

export function startGame(roomCode: string, roomData: RoomData): RoomData {
  if (roomData.gameStarted) {
    throw new Error(`Cannot start a game this is already started.`);
  }

  const updatedRoomData: RoomData = {
    deck: [],
    discard: [],
    round: null,
    gameStarted: true,
    players: roomData.players,
    roundLog: [],
  };

  return startRound(roomCode, updatedRoomData);
}

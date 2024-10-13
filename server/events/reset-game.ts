import { Rooms } from "../repositories/Rooms.ts";
import { updatePlayer } from "../events/utils/mod.ts";
import type { RoomData } from "../types/types.ts";

export function resetGame(roomCode: string, roomData: RoomData): RoomData {
  let updatedPlayers: RoomData["players"] = roomData.players;
  for (const [playerId] of roomData.players) {
    updatedPlayers = updatePlayer(updatedPlayers, playerId, {
      cards: [],
      gameScore: 0,
      handmaidProtected: false,
      outOfRound: false,
      playedSpy: false,
    });
  }

  const updatedRoomData: RoomData = {
    deck: [],
    discard: [],
    round: null,
    roundLog: [],
    gameStarted: false,
    players: updatedPlayers,
  };

  Rooms.set(roomCode, updatedRoomData);

  return updatedRoomData;
}

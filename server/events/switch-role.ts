import { Rooms } from "../repositories/Rooms.ts";
import type { PlayerId, RoomData } from "../types/types.ts";

export function switchRole(roomCode: string, roomData: RoomData, playerSwitchingId: PlayerId): RoomData {
  const players = new Map(roomData.players);
  const spectators = new Map(roomData.spectators);

  if (players.has(playerSwitchingId)) {
    const playerToMakeSpectator = players.get(playerSwitchingId)!;

    spectators.set(playerSwitchingId, playerToMakeSpectator.name);
    players.delete(playerSwitchingId);
  } else if (spectators.has(playerSwitchingId)) {
    if (players.size >= 6) {
      throw new Error(`Cannot move spectator to player. Room is full.`);
    }
    const spectatorName = spectators.get(playerSwitchingId)!;

    players.set(playerSwitchingId, {
      cards: [],
      gameScore: 0,
      handmaidProtected: false,
      name: spectatorName,
      outOfRound: false,
      playedSpy: false,
    });
    spectators.delete(playerSwitchingId);
  }

  const updatedRoomData: RoomData = {
    ...roomData,
    players,
    spectators,
  };

  Rooms.set(roomCode, updatedRoomData);

  return updatedRoomData;
}

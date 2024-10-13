import { Rooms } from "../repositories/Rooms.ts";
import type { Player, PlayerId, RoomData } from "../types/types.ts";

export function join(roomCode: string, roomData: RoomData, playerId: PlayerId, name: string): RoomData {
  // add the new player to the room
  const newPlayer: Player = {
    cards: [],
    gameScore: 0,
    handmaidProtected: false,
    playedSpy: false,
    name,
    outOfRound: false,
  };

  const newPlayers = new Map(roomData.players);
  newPlayers.set(playerId, newPlayer);

  const updatedRoomData: RoomData = {
    ...roomData,
    players: newPlayers,
  };

  Rooms.set(roomCode, updatedRoomData);

  return updatedRoomData;
}

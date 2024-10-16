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

  let updatedRoomData: RoomData | null = null;

  if (roomData.players.size >= 6 || roomData.gameStarted) {
    const newSpectators = new Map(roomData.spectators);
    newSpectators.set(playerId, name);

    updatedRoomData = {
      ...roomData,
      spectators: newSpectators,
      roundLog: [...roomData.roundLog, `${name} joined the room as a spectator.`],
    };
  } else {
    const newPlayers = new Map(roomData.players);
    newPlayers.set(playerId, newPlayer);

    updatedRoomData = {
      ...roomData,
      players: newPlayers,
      roundLog: [...roomData.roundLog, `${name} joined the room.`],
    };
  }

  Rooms.set(roomCode, updatedRoomData);

  return updatedRoomData;
}

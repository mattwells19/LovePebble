import { sample } from "jsr:@std/collections@1.0.7";
import { Rooms } from "../repositories/Rooms.ts";
import type { Player, PlayerId, RoomDataGameNotStarted } from "../types/types.ts";

export function getNewRoomCode(): string {
  let newRoomCode = "";

  do {
    newRoomCode = "";

    for (let i = 0; i < 4; i++) {
      newRoomCode += sample(alphabet);
    }
  } while (Rooms.has(newRoomCode));

  return newRoomCode;
}

export function createRoomWithCode(roomCode: string): RoomDataGameNotStarted {
  if (Rooms.has(roomCode)) {
    throw new Error(`Cannot create a room with code ${roomCode} as a room with that code already exists.`);
  } else {
    const newRoomData: RoomDataGameNotStarted = {
      deck: [],
      discard: [],
      game: {
        started: false,
        playerTurnId: null,
      },
      players: new Map<PlayerId, Player>(),
    };
    Rooms.set(roomCode, newRoomData);
    return newRoomData;
  }
}

export function checkRoomCode(roomCode: string): boolean {
  return Rooms.has(roomCode);
}

export function removePlayerFromRoom(roomCode: string, playerId: PlayerId) {
  if (Rooms.has(roomCode)) {
    const room = Rooms.get(roomCode)!;
    room.players.delete(playerId);

    if (room.players.size === 0) {
      Rooms.delete(roomCode);
    }
  }
}

const alphabet: Array<string> = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

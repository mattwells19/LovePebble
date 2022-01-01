import { sample } from "../deps.ts";
import { Rooms } from "../repositories/Rooms.ts";
import type { Player, PlayerId, RoomData } from "../types/types.ts";

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

export function createNewRoom(): string {
  const newRoomCode = getNewRoomCode();

  Rooms.set(newRoomCode, {
    deck: [],
    game: {
      started: false,
      playerTurnId: null,
    },
    players: new Map<PlayerId, Player>(),
  });

  return newRoomCode;
}

export function createRoomWithCode(roomCode: string): RoomData {
  if (Rooms.has(roomCode)) {
    throw new Error(`Cannot create a room with code ${roomCode} as a room with that code already exists.`);
  } else {
    Rooms.set(roomCode, {
      deck: [],
      game: {
        started: false,
        playerTurnId: null,
      },
      players: new Map<PlayerId, Player>(),
    });
    return Rooms.get(roomCode)!;
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

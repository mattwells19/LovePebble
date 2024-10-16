import { sample } from "jsr:@std/collections@1.0.7";
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
  const roomCode = getNewRoomCode();
  const newRoomData: RoomData = {
    deck: [],
    discard: [],
    round: null,
    roundLog: [],
    gameStarted: false,
    players: new Map<PlayerId, Player>(),
    spectators: new Map<PlayerId, string>(),
  };
  Rooms.set(roomCode, newRoomData);
  return roomCode;
}

export function checkRoomCode(roomCode: string): boolean {
  return Rooms.has(roomCode);
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

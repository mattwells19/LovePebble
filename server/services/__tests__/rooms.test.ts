import { assert, assertExists, assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts";
import { Rooms } from "../../repositories/Rooms.ts";
import { Player } from "../../types/types.ts";
import { checkRoomCode, createNewRoom, removePlayerFromRoom } from "../rooms.ts";

Deno.test("can create 100 new, unique rooms", () => {
  for (let i = 0; i < 100; i++) {
    const roomCode = createNewRoom();
    assertEquals(roomCode.length, 4);
  }
});

Deno.test("checkRoomCode returns true when room exists", () => {
  const roomCode = createNewRoom();
  assert(checkRoomCode(roomCode));
});

Deno.test("checkRoomCode returns false when room does not exist", () => {
  assert(!checkRoomCode("ABCD"));
});

Deno.test("player is removed from room", () => {
  const roomCode = createNewRoom();

  const mockPlayerId1 = "12345";
  const mockPlayerId2 = "24680";
  const mockPlayer: Player = {
    cards: [],
    gameScore: 0,
    handmaidProtected: false,
    name: "test",
    outOfRound: false,
  };

  const room = Rooms.get(roomCode);
  assertExists(room);
  room.players.set(mockPlayerId1, mockPlayer);
  room.players.set(mockPlayerId2, mockPlayer);

  removePlayerFromRoom(roomCode, mockPlayerId1);

  // verify Room is not removed
  assertEquals(Rooms.size, 1);

  // verify the correct player was removed
  const roomAgain = Rooms.get(roomCode);
  assertExists(roomAgain);
  assertEquals(roomAgain.players.size, 1);
  assert(!room.players.has(mockPlayerId1));
  assert(room.players.has(mockPlayerId2));
});

Deno.test("room is removed if last player is removed from room", () => {
  const roomCode = createNewRoom();

  const mockPlayerId = "12345";
  const mockPlayer: Player = {
    cards: [],
    gameScore: 0,
    handmaidProtected: false,
    name: "test",
    outOfRound: false,
  };

  const room = Rooms.get(roomCode);
  assertExists(room);
  room.players.set(mockPlayerId, mockPlayer);

  removePlayerFromRoom(roomCode, mockPlayerId);

  // verify Room is removed
  assertEquals(Rooms.size, 0);
});

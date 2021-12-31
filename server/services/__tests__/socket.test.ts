import { assert, assertEquals, assertExists } from "https://deno.land/std@0.119.0/testing/asserts.ts";
import { Sockets } from "../../repositories/Sockets.ts";
import { Rooms } from "../../repositories/Rooms.ts";
import { registerSocketHandlers } from "../socket.ts";
import { createNewRoom } from "../rooms.ts";
import { SocketIncoming, SocketOutgoing } from "../../types/socket.types.ts";
import { Player, PlayerId } from "../../types/types.ts";
import { getMockWebSocket, testCleanup } from "../../test.utils.ts";

Deno.test("Websocket connection is established", () => {
  let value = { type: "", data: null };

  assertEquals(Sockets.size, 0);

  const ws = getMockWebSocket({
    send: (msg: string) => {
      value = JSON.parse(msg);
    },
  });

  registerSocketHandlers(ws);

  assertExists(ws.onopen);
  ws.onopen(new Event(""));

  assertEquals(value.type, SocketOutgoing.Connected);
  assertExists(value.data);
  assertEquals(typeof value.data, "string");

  assertEquals(Sockets.size, 1);
  assert(Sockets.has(value.data));

  // Cleanup
  testCleanup();
});

Deno.test("cleans up after Websocket connection is closed", () => {
  const ws = getMockWebSocket();
  registerSocketHandlers(ws);

  assertExists(ws.onopen);
  ws.onopen(new Event(""));

  assertEquals(Sockets.size, 1);

  assertExists(ws.onclose);
  ws.onclose(new CloseEvent(""));

  assertEquals(Sockets.size, 0);

  // Cleanup
  testCleanup();
});

Deno.test("player can change rooms", () => {
  let players = new Map<PlayerId, Player>();
  let playerId: PlayerId | null = null;

  const ws = getMockWebSocket({
    send: (msg: string) => {
      const response = JSON.parse(msg);
      switch (response.type) {
        case SocketOutgoing.Connected:
          playerId = response.data;
          break;
        case SocketOutgoing.PlayerUpdate:
          players = new Map(response.data);
      }
    },
  });
  registerSocketHandlers(ws);

  // connect to socket server
  assertExists(ws.onopen);
  ws.onopen(new Event(""));
  assertEquals(Sockets.size, 1);

  // create a new room to join
  const roomCode = createNewRoom();

  // join the room
  assertExists(ws.onmessage);
  ws.onmessage(
    new MessageEvent("join", {
      data: JSON.stringify({
        type: SocketIncoming.Join,
        roomCode,
        playerName: "test",
      }),
    }),
  );

  assertEquals(Rooms.size, 1);

  // verify room was created correctly with player
  const room = Rooms.get(roomCode);
  assertExists(room);
  assertExists(playerId);
  assert(room.players.has(playerId));

  // verify playerUpdate was correctly sent
  assertEquals(players.size, 1);
  assert(players.has(playerId));

  // create a new room to join
  const newRoomCode = createNewRoom();

  // join the new room
  assertExists(ws.onmessage);
  ws.onmessage(
    new MessageEvent("join", {
      data: JSON.stringify({
        type: SocketIncoming.Join,
        roomCode: newRoomCode,
        playerName: "test",
      }),
    }),
  );

  // verify the new room is created, the player is removed from the old room
  // and the new room is created with the player
  assertEquals(Rooms.size, 1);
  assert(!Rooms.has(roomCode));
  assert(Rooms.has(newRoomCode));

  const newRoom = Rooms.get(newRoomCode);
  assertExists(newRoom);
  assert(newRoom.players.has(playerId));

  // Cleanup
  testCleanup();
});

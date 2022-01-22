import { assert, assertEquals, assertExists, assertObjectMatch } from "../../deps.ts";
import * as socketActions from "../socketActions.ts";
import { testCleanup } from "../../test.utils.ts";
import { Player, PlayerId, RoomData, StandardDeck } from "../../types/types.ts";

Deno.test("Join | New player can join a room", () => {
  const result = socketActions.join(
    "12345",
    { deck: [], discard: [], game: { started: false, playerTurnId: null }, players: new Map<PlayerId, Player>() },
    "test",
  );

  assertEquals(result.players.size, 1);
  assert(result.players.has("12345"));
  assertObjectMatch(result.players.get("12345")!, {
    cards: [],
    gameScore: 0,
    handmaidProtected: false,
    name: "test",
    outOfRound: false,
  });
});

const MockTwoPlayerRoomData: RoomData = {
  deck: [],
  discard: [],
  game: { started: false, playerTurnId: null },
  players: new Map<PlayerId, Player>([
    ["12345", { cards: [], gameScore: 0, handmaidProtected: false, name: "Player 1", outOfRound: false }],
    ["24680", { cards: [], gameScore: 0, handmaidProtected: false, name: "Player 2", outOfRound: false }],
  ]),
};

Deno.test("Join | Player can reconnect to a room", () => {
  const mockPlayers = new Map<PlayerId, Player>([
    ["12345", { cards: [], gameScore: 0, handmaidProtected: false, name: "Player 1", outOfRound: false }],
    ["24680", { cards: [], gameScore: 1, handmaidProtected: true, name: "Replace me", outOfRound: false }],
  ]);
  const mockRoomData: RoomData = {
    ...MockTwoPlayerRoomData,
    players: mockPlayers,
  };

  const newPlayerId = "789654";
  const result = socketActions.join(newPlayerId, mockRoomData, "Replace me", "24680");

  assertEquals(result.players.size, 2);

  // new player is added with old player's data
  assert(result.players.has("789654"));
  assertObjectMatch(result.players.get("789654")!, {
    cards: [],
    gameScore: 1,
    handmaidProtected: true,
    name: "Replace me",
    outOfRound: false,
  });

  // old player entry is removed
  assert(!result.players.has("24680"));
});

Deno.test("Start Game | Any players | First player in room is given the turn first", () => {
  const firstPlayerIdInRoom = Array.from(MockTwoPlayerRoomData.players.keys())[0];

  const result = socketActions.startGame(MockTwoPlayerRoomData);

  assertEquals(result.game.started, true);
  assertExists(result.game.playerTurnId);
  assertEquals(result.game.playerTurnId, firstPlayerIdInRoom);
});

Deno.test("Start Game | 2 Players | Final deck count is correct", () => {
  const result = socketActions.startGame(MockTwoPlayerRoomData);

  assertEquals(result.game.started, true);
  assertExists(result.game.playerTurnId);

  /**
   * a 2 player game removes 3 cards from the deck, 2 cards go to the player whose turn it is
   * and 1 card goes to the other player
   */
  const expectedDeckCount = StandardDeck.length - 3 - 2 - 1;
  assertEquals(result.deck.length, expectedDeckCount);
});

Deno.test("Start Game | 2 Players | Discard is correct", () => {
  const result = socketActions.startGame(MockTwoPlayerRoomData);

  assertEquals(result.game.started, true);
  assertExists(result.game.playerTurnId);

  /**
   * a 2 player game discards 3 cards from the deck
   */
  assertEquals(result.discard.length, 3);

  const reconstructedDeck = [
    ...result.deck,
    ...result.discard,
    ...Array.from(result.players).flatMap(([, player]) => player.cards),
  ];

  assertEquals(reconstructedDeck.length, StandardDeck.length);
  assertEquals(StandardDeck.slice().sort(), reconstructedDeck.sort());
});

Deno.test("Start Game | 2 Players | Current player is given 2 cards and the other 1", () => {
  const playersInRoom = MockTwoPlayerRoomData.players;

  const result = socketActions.startGame(MockTwoPlayerRoomData);

  assertExists(result.game.playerTurnId);

  Array.from(playersInRoom, ([playerId]) => {
    const resultPlayerData = result.players.get(playerId);
    assertExists(resultPlayerData);

    if (playerId === result.game.playerTurnId) {
      // player whose turn it is should have 2 cards
      assertEquals(resultPlayerData.cards.length, 2);
    } else {
      // player whose turn it is not should have 1 card
      assertEquals(resultPlayerData.cards.length, 1);
    }
  });
});

Deno.test("Start Game | 2 Players | Room size on start is set correctly", () => {
  const result = socketActions.startGame(MockTwoPlayerRoomData);

  assert(result.game.started);
  assertEquals(result.game.roomSizeOnStart, 2);
});

const MockThreePlayerRoomData: RoomData = {
  deck: [],
  discard: [],
  game: { started: false, playerTurnId: null },
  players: new Map<PlayerId, Player>([
    ["12345", { cards: [], gameScore: 0, handmaidProtected: false, name: "Player 1", outOfRound: false }],
    ["24680", { cards: [], gameScore: 0, handmaidProtected: false, name: "Player 2", outOfRound: false }],
    ["13591", { cards: [], gameScore: 0, handmaidProtected: false, name: "Player 3", outOfRound: false }],
  ]),
};

Deno.test("Start Game | More than 2 players | Final deck count is correct", () => {
  const result = socketActions.startGame(MockThreePlayerRoomData);

  assertEquals(result.game.started, true);
  assertExists(result.game.playerTurnId);

  /**
   * more than 2 player game removes 1 card from the deck, 2 cards go to the player whose turn it is
   * and 1 card goes to the other player two players
   */
  const expectedDeckCount = StandardDeck.length - 1 - 2 - 1 - 1;
  assertEquals(result.deck.length, expectedDeckCount);
});

Deno.test("Start Game | More than 2 Players | Current player is given 2 cards and the other players get 1", () => {
  const playersInRoom = MockThreePlayerRoomData.players;

  const result = socketActions.startGame(MockThreePlayerRoomData);

  assertExists(result.game.playerTurnId);

  Array.from(playersInRoom, ([playerId]) => {
    const resultPlayerData = result.players.get(playerId);
    assertExists(resultPlayerData);

    if (playerId === result.game.playerTurnId) {
      // player whose turn it is should have 2 cards
      assertEquals(resultPlayerData.cards.length, 2);
    } else {
      // player whose turn it is not should have 1 card
      assertEquals(resultPlayerData.cards.length, 1);
    }
  });
});

Deno.test("Start Game | More than 2 Players | Discard is correct", () => {
  const result = socketActions.startGame(MockThreePlayerRoomData);

  assertEquals(result.game.started, true);
  assertExists(result.game.playerTurnId);

  /**
   * a more than 2 player game discards 1 card from the deck
   */
  assertEquals(result.discard.length, 1);

  const reconstructedDeck = [
    ...result.deck,
    ...result.discard,
    ...Array.from(result.players).flatMap(([, player]) => player.cards),
  ];

  assertEquals(reconstructedDeck.length, StandardDeck.length);
  assertEquals(StandardDeck.slice().sort(), reconstructedDeck.sort());

  testCleanup();
});

Deno.test("Start Game | More than 2 Players | Room size on start is set correctly", () => {
  const result = socketActions.startGame(MockThreePlayerRoomData);

  assert(result.game.started);
  assertEquals(result.game.roomSizeOnStart, MockThreePlayerRoomData.players.size);
});

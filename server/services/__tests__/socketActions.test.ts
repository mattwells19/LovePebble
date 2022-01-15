import {
  assert,
  assertEquals,
  assertExists,
  assertObjectMatch,
  assertArrayIncludes,
} from "https://deno.land/std@0.119.0/testing/asserts.ts";
import * as socketActions from "../socketActions.ts";
import { Rooms } from "../../repositories/Rooms.ts";
import { testCleanup } from "../../test.utils.ts";
import { Card, Player, PlayerId, RoomData, StandardDeck } from "../../types/types.ts";
import { SocketOutgoing } from "../../types/socket.types.ts";

Deno.test("player can join a room", () => {
  const playerMap = new Map<PlayerId, Player>();

  const result = socketActions.join(
    { playerId: "12345", roomId: null },
    { deck: [], game: { started: false, playerTurnId: null }, players: playerMap },
    "test",
  );

  assert(playerMap.has("12345"));
  assertEquals(playerMap.get("12345")!.name, "test");

  assertEquals(result.data.length, 1);
  assertEquals(result.data[0][0], "12345");
  assertObjectMatch(result.data[0][1], {
    cards: [],
    gameScore: 0,
    handmaidProtected: false,
    name: "test",
    outOfRound: false,
  });

  assertEquals(result.type, SocketOutgoing.PlayerUpdate);

  testCleanup();
});

const MockTwoPlayerRoomData: RoomData = {
  deck: [],
  game: { started: false, playerTurnId: null },
  players: new Map<PlayerId, Player>([
    ["12345", { cards: [], gameScore: 0, handmaidProtected: false, name: "Player 1", outOfRound: false }],
    ["24680", { cards: [], gameScore: 0, handmaidProtected: false, name: "Player 2", outOfRound: false }],
  ]),
};

Deno.test("Start Game | Any players | First player in room is given the turn first", () => {
  const firstPlayerIdInRoom = Array.from(MockTwoPlayerRoomData.players.keys())[0];

  const result = socketActions.startGame("ABCD", MockTwoPlayerRoomData);

  const actualRoomData = Rooms.get("ABCD");
  assertExists(actualRoomData);
  assertEquals(actualRoomData.game.started, true);
  assertExists(actualRoomData.game.playerTurnId);

  assertEquals(actualRoomData.game.playerTurnId, firstPlayerIdInRoom);
  assertEquals(result.data.game.playerTurnId, firstPlayerIdInRoom);

  assert(result.type, SocketOutgoing.GameUpdate);

  testCleanup();
});

Deno.test("Start Game | 2 Players | Final deck count is correct", () => {
  const result = socketActions.startGame("ABCD", MockTwoPlayerRoomData);

  const actualRoomData = Rooms.get("ABCD");
  assertExists(actualRoomData);
  assertEquals(actualRoomData.game.started, true);
  assertExists(actualRoomData.game.playerTurnId);

  /**
   * a 2 player game removes 3 cards from the deck, 2 cards go to the player whose turn it is
   * and 1 card goes to the other player
   */
  const expectedDeckCount = StandardDeck.length - 3 - 2 - 1;
  assertEquals(actualRoomData.deck.length, expectedDeckCount);
  assertEquals(result.data.deckCount, expectedDeckCount);

  testCleanup();
});

Deno.test("Start Game | 2 Players | Current player is given 2 cards and the other 1", () => {
  const playersInRoom = MockTwoPlayerRoomData.players;

  const result = socketActions.startGame("ABCD", MockTwoPlayerRoomData);

  const actualRoomData = Rooms.get("ABCD");
  assertExists(actualRoomData);
  assertExists(actualRoomData.game.playerTurnId);

  Array.from(playersInRoom, ([playerId]) => {
    const actualPlayerData = actualRoomData.players.get(playerId);
    assertExists(actualPlayerData);
    const resultPlayerData = result.data.players.find((p) => p[0] === playerId)?.[1];
    assertExists(resultPlayerData);

    if (playerId === actualRoomData.game.playerTurnId) {
      // player whose turn it is should have 2 cards
      assertEquals(actualPlayerData.cards.length, 2);
      assertEquals(resultPlayerData.cards.length, 2);
    } else {
      // player whose turn it is not should have 1 card
      assertEquals(actualPlayerData.cards.length, 1);
      assertEquals(resultPlayerData.cards.length, 1);
    }
  });

  // verify that all cards were distributed correctly and resulting deck is correct
  const allPlayersCards: Array<Card> = result.data.players.reduce((playerCards, curr) => {
    return [...playerCards, ...curr[1].cards];
  }, [] as Array<Card>);

  const reconstructedDeck = [...allPlayersCards, ...actualRoomData.deck];
  // StandardDeck minus 3 since 3 cards are automatically removed from the deck on start
  assertEquals(StandardDeck.length - 3, reconstructedDeck.length);
  assertArrayIncludes(StandardDeck, reconstructedDeck);

  testCleanup();
});

const MockThreePlayerRoomData: RoomData = {
  deck: [],
  game: { started: false, playerTurnId: null },
  players: new Map<PlayerId, Player>([
    ["12345", { cards: [], gameScore: 0, handmaidProtected: false, name: "Player 1", outOfRound: false }],
    ["24680", { cards: [], gameScore: 0, handmaidProtected: false, name: "Player 2", outOfRound: false }],
    ["13591", { cards: [], gameScore: 0, handmaidProtected: false, name: "Player 3", outOfRound: false }],
  ]),
};

Deno.test("Start Game | More than 2 players | Final deck count is correct", () => {
  const result = socketActions.startGame("ABCD", MockThreePlayerRoomData);

  const actualRoomData = Rooms.get("ABCD");
  assertExists(actualRoomData);
  assertEquals(actualRoomData.game.started, true);
  assertExists(actualRoomData.game.playerTurnId);

  /**
   * more than 2 player game removes 1 card from the deck, 2 cards go to the player whose turn it is
   * and 1 card goes to the other player two players
   */
  const expectedDeckCount = StandardDeck.length - 1 - 2 - 1 - 1;
  assertEquals(actualRoomData.deck.length, expectedDeckCount);
  assertEquals(result.data.deckCount, expectedDeckCount);

  testCleanup();
});

Deno.test("Start Game | More than 2 Players | Current player is given 2 cards and the other players get 1", () => {
  const playersInRoom = MockThreePlayerRoomData.players;

  const result = socketActions.startGame("ABCD", MockThreePlayerRoomData);

  const actualRoomData = Rooms.get("ABCD");
  assertExists(actualRoomData);
  assertExists(actualRoomData.game.playerTurnId);

  Array.from(playersInRoom, ([playerId]) => {
    const actualPlayerData = actualRoomData.players.get(playerId);
    assertExists(actualPlayerData);
    const resultPlayerData = result.data.players.find((p) => p[0] === playerId)?.[1];
    assertExists(resultPlayerData);

    if (playerId === actualRoomData.game.playerTurnId) {
      // player whose turn it is should have 2 cards
      assertEquals(actualPlayerData.cards.length, 2);
      assertEquals(resultPlayerData.cards.length, 2);
    } else {
      // player whose turn it is not should have 1 card
      assertEquals(actualPlayerData.cards.length, 1);
      assertEquals(resultPlayerData.cards.length, 1);
    }
  });

  // verify that all cards were distributed correctly and resulting deck is correct
  const allPlayersCards: Array<Card> = result.data.players.reduce((playerCards, curr) => {
    return [...playerCards, ...curr[1].cards];
  }, [] as Array<Card>);

  const reconstructedDeck = [...allPlayersCards, ...actualRoomData.deck];
  // StandardDeck minus 1 since 1 card is automatically removed from the deck on start
  assertEquals(StandardDeck.length - 1, reconstructedDeck.length);
  assertArrayIncludes(StandardDeck, reconstructedDeck);

  testCleanup();
});

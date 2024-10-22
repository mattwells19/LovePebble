import { sample } from "@std/collections";
import { Rooms } from "../repositories/Rooms.ts";
import { LOG_MESSAGES, updatePlayer } from "../events/utils/mod.ts";
import { type Card, type Player, type PlayerId, type RoomData, type RoundData, StandardDeck } from "../types/types.ts";
import { getRoundWinningPlayers } from "./utils/game-over.ts";

export const randomOf = (max: number): number => Math.floor(Math.random() * max);

export const shuffle = <T>(array: T[]): T[] => {
  const clone = array.slice();
  const l = array.length;
  let r: number; // random number;
  let temp: T; // storage;
  for (let i = 0; i < l; i++) {
    r = randomOf(l);
    temp = clone[r];
    clone[r] = clone[i];
    clone[i] = temp;
  }
  return clone;
};

export function startRound(roomCode: string, roomData: RoomData): RoomData {
  const roundWinningPlayers = getRoundWinningPlayers(roomData);

  const startingPlayerTurnId = (() => {
    const winningPlayerIds = Array.from(roundWinningPlayers.keys());

    if (winningPlayerIds.length === 0) {
      return Array.from(roomData.players.keys())[0];
    }
    if (winningPlayerIds.length === 1) {
      return winningPlayerIds[0];
    }

    return sample(winningPlayerIds)!;
  })();

  const updatedRound: RoundData = {
    cardPlayed: null,
    details: null,
    playerTurnId: startingPlayerTurnId,
  };

  let updatedPlayers: RoomData["players"] = new Map(roomData.players);
  for (const [playerId] of roomData.players) {
    updatedPlayers = updatePlayer(updatedPlayers, playerId, {
      cards: [],
      handmaidProtected: false,
      outOfRound: false,
      playedSpy: false,
    });
  }

  const deck = shuffle(StandardDeck.slice());
  const discard: Array<Card> = [];

  // since this is the start of the game, we are guaranteed to have enough cards
  // for even the max number of players so pop is always safe here
  discard.push(deck.pop()!);
  if (roomData.players.size === 2) {
    discard.push(deck.pop()!);
    discard.push(deck.pop()!);
    discard.push(deck.pop()!);
  }

  updatedPlayers.forEach((player: Player, id: PlayerId) => {
    const playerHand: Array<Card> = [];

    // since this is the start of the game, we are guaranteed to have enough cards
    // for even the max number of players so pop is always safe here
    playerHand.push(deck.pop()!);

    // add extra card to the player whose turn it is
    if (updatedRound.playerTurnId === id) {
      playerHand.push(deck.pop()!);
    }

    updatedPlayers.set(id, {
      ...player,
      cards: playerHand,
    });
  });

  const updatedRoomData: RoomData = {
    deck,
    discard,
    round: updatedRound,
    players: updatedPlayers,
    spectators: roomData.spectators,
    roundLog: [LOG_MESSAGES.startRound],
    gameStarted: true,
  };
  Rooms.set(roomCode, updatedRoomData);

  return updatedRoomData;
}

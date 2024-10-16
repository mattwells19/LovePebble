import { Rooms } from "../repositories/Rooms.ts";
import { updatePlayer } from "../events/utils/mod.ts";
import { type Card, type Player, type PlayerId, type RoomData, type RoundData, StandardDeck } from "../types/types.ts";

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
  const updatedRound: RoundData = {
    cardPlayed: null,
    details: null,
    playerTurnId: roomData.players.keys().next().value!,
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

  switch (roomData.players.size) {
    // since this is the start of the game, we are guaranteed to have enough cards
    // for even the max number of players so pop is always safe here
    case 2:
      discard.push(deck.pop()!);
      discard.push(deck.pop()!);
    /* falls through */
    default:
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
    roundLog: ["Game started!"],
    gameStarted: true,
  };
  Rooms.set(roomCode, updatedRoomData);

  return updatedRoomData;
}

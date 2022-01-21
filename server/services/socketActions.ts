import { Card, GameData, Player, PlayerId, RoomData, StandardDeck } from "../types/types.ts";
import { shuffle } from "../utils.ts";

export function join(playerId: PlayerId, room: RoomData, playerName: string, oldPlayerId?: PlayerId): RoomData {
  let playerData: Player | null = null;
  const updatedPlayers = new Map(room.players);

  if (oldPlayerId && updatedPlayers.has(oldPlayerId)) {
    playerData = updatedPlayers.get(oldPlayerId)!;
    updatedPlayers.delete(oldPlayerId);
  } else {
    // add the new player to the room
    playerData = {
      cards: [],
      gameScore: 0,
      handmaidProtected: false,
      name: playerName,
      outOfRound: false,
    };
  }

  updatedPlayers.set(playerId, playerData);

  return {
    ...room,
    players: updatedPlayers,
  };
}

export function startGame(room: RoomData): RoomData {
  const updatedGameState: GameData = {
    cardPlayed: null,
    details: null,
    playerTurnId: room.players.keys().next().value,
    roomSizeOnStart: room.players.size,
    started: true,
    winningSpyPlayerId: null,
  };

  const deck = shuffle(StandardDeck.slice());
  const discard: Array<Card> = [];

  switch (room.players.size) {
    // since this is the start of the game, we are guaranteed to have enough cards
    // for even the max number of players so pop is always safe here
    case 2:
      discard.push(deck.pop()!);
      discard.push(deck.pop()!);
    /* falls through */
    default:
      discard.push(deck.pop()!);
  }

  const updatedPlayers = new Map(room.players);
  updatedPlayers.forEach((player: Player, id: PlayerId) => {
    const playerHand: Array<Card> = [];

    // since this is the start of the game, we are guaranteed to have enough cards
    // for even the max number of players so pop is always safe here
    playerHand.push(deck.pop()!);

    // add extra card to the player whose turn it is
    if (updatedGameState.playerTurnId === id) {
      playerHand.push(deck.pop()!);
    }

    updatedPlayers.set(id, {
      ...player,
      cards: playerHand,
    });
  });

  return {
    deck,
    discard,
    game: updatedGameState,
    players: updatedPlayers,
  };
}

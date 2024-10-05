import { Rooms } from "../repositories/Rooms.ts";
import { OutgoingGameStateUpdate, SocketOutgoing } from "../types/socket.types.ts";
import { Card, GameData, Player, PlayerId, RoomData, StandardDeck, RoomDataGameNotStarted } from "../types/types.ts";
import { shuffle } from "../utils.ts";
import { SocketData } from "./socket.ts";

interface JoinResult {
  type: SocketOutgoing.PlayerUpdate;
  data: [PlayerId, Player][];
}

export function join(socketData: SocketData, room: RoomData | RoomDataGameNotStarted, playerName: string): JoinResult {
  // add the new player to the room
  const newPlayer: Player = {
    cards: [],
    gameScore: 0,
    handmaidProtected: false,
    name: playerName,
    outOfRound: false,
  };
  room.players.set(socketData.playerId, newPlayer);

  return {
    data: Array.from(room.players),
    type: SocketOutgoing.PlayerUpdate,
  };
}

export function startGame(roomCode: string, room: RoomDataGameNotStarted): OutgoingGameStateUpdate {
  const updatedGameState: GameData = {
    cardPlayed: null,
    details: null,
    playerTurnId: room.players.keys().next().value!,
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

  const updatedRoomData: RoomData = {
    deck,
    discard,
    game: updatedGameState,
    players: updatedPlayers,
  };
  Rooms.set(roomCode, updatedRoomData);

  const gameData: OutgoingGameStateUpdate = {
    deckCount: deck.length,
    discard,
    game: updatedGameState,
    players: Array.from(updatedPlayers),
  };

  return gameData;
}

export function handleSelectPlayer(
  roomCode: string,
  room: RoomData,
  playerSelected: string,
): OutgoingGameStateUpdate | null {
  if (!room.game.details || !("chosenPlayerId" in room.game.details)) {
    return null;
  }

  const updatedRoomData: RoomData = {
    ...room,
    game: {
      ...room.game,
      details: {
        ...room.game.details,
        chosenPlayerId: playerSelected,
      },
    },
  };

  Rooms.set(roomCode, updatedRoomData);

  return {
    deckCount: updatedRoomData.deck.length,
    discard: updatedRoomData.deck,
    game: updatedRoomData.game,
    players: Array.from(updatedRoomData.players),
  };
}

/**
 * Removes card from the player's hand and adds it to the discard
 */
const cardPlayed = (roomData: RoomData, card: Card): RoomData => {
  const player = roomData.players.get(roomData.game.playerTurnId);
  if (!player) throw new Error("Where'd this player go??");

  const updatedPlayer: Player = {
    ...player,
    cards: player.cards.filter((c) => c !== card),
  };
  const updatedPlayers = new Map(roomData.players);
  updatedPlayers.set(roomData.game.playerTurnId, updatedPlayer);

  const newDiscard = [...roomData.discard, card];

  return {
    ...roomData,
    discard: newDiscard,
    players: updatedPlayers,
  };
};

const getNextPlayerTurnId = (roomData: RoomData): string => {
  const playerIds = Array.from(roomData.players.keys());
  const currentPlayerTurnIdIndex = playerIds.indexOf(roomData.game.playerTurnId);
  const newPlayerTurnId =
    currentPlayerTurnIdIndex === playerIds.length - 1 ? playerIds.at(0) : playerIds.at(currentPlayerTurnIdIndex + 1);
  if (!newPlayerTurnId) {
    throw new Error("Idk whose turn is next");
  }
  return newPlayerTurnId;
};

export function handlePlayedSpy(roomCode: string, roomData: RoomData): OutgoingGameStateUpdate {
  const roomDataWithCardPlayed = cardPlayed(roomData, Card.Spy);

  const newGameState: OutgoingGameStateUpdate = {
    deckCount: roomDataWithCardPlayed.deck.length,
    discard: roomDataWithCardPlayed.discard,
    players: Array.from(roomDataWithCardPlayed.players),
    game: {
      ...roomDataWithCardPlayed.game,
      playerTurnId: getNextPlayerTurnId(roomDataWithCardPlayed),
      winningSpyPlayerId: roomDataWithCardPlayed.game.winningSpyPlayerId
        ? null
        : roomDataWithCardPlayed.game.playerTurnId,
      cardPlayed: null,
      details: null,
    },
  };

  const updatedRoomData: RoomData = {
    ...roomDataWithCardPlayed,
    game: newGameState.game,
  };
  Rooms.set(roomCode, updatedRoomData);

  return newGameState;
}

export function handlePlayedGuard(roomCode: string, roomData: RoomData): OutgoingGameStateUpdate {
  const roomDataWithCardPlayed = cardPlayed(roomData, Card.Guard);

  const newGameState: OutgoingGameStateUpdate = {
    deckCount: roomDataWithCardPlayed.deck.length,
    discard: roomDataWithCardPlayed.discard,
    players: Array.from(roomDataWithCardPlayed.players),
    game: {
      ...roomDataWithCardPlayed.game,
      cardPlayed: Card.Guard,
      details: {
        card: null,
        chosenPlayerId: null,
        submitted: false,
      },
    },
  };

  const updatedRoomData: RoomData = {
    ...roomDataWithCardPlayed,
    game: newGameState.game,
  };
  Rooms.set(roomCode, updatedRoomData);

  return newGameState;
}

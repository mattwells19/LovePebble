import { Rooms } from "../repositories/Rooms.ts";
import { type OutgoingGameStateUpdate, SocketOutgoing } from "../types/socket.types.ts";
import {
  Card,
  type GameData,
  type Player,
  type PlayerId,
  type RoomData,
  type RoomDataGameNotStarted,
  StandardDeck,
} from "../types/types.ts";
import { shuffle } from "../utils.ts";
import type { SocketData } from "./socket.ts";
import * as cardActionHandlers from "./card-action-handlers.ts";
import { knockPlayerOutOfRound, prepRoomDataForNextTurn } from "./gameFlow.ts";
import { validatePlayerExists } from "./validators.ts";

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
    playedSpy: false,
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
    lastMoveDescription: null,
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

export function handlePlayCard(roomCode: string, roomData: RoomData, cardPlayed: Card): OutgoingGameStateUpdate {
  const roomDataWithCardPlayed: RoomData = (() => {
    const player = validatePlayerExists(roomData, roomData.game.playerTurnId);

    const cardPlayedIndex = player.cards.findIndex((card) => card === cardPlayed);
    if (cardPlayedIndex === -1) {
      throw new Error(`Player did not have ${cardPlayed} in hand. Hand: ${player.cards.join(", ")}`);
    }

    const updatedPlayer: Player = {
      ...player,
      cards: player.cards.toSpliced(cardPlayedIndex, 1),
      handmaidProtected: false,
    };
    const updatedPlayers = new Map(roomData.players);
    updatedPlayers.set(roomData.game.playerTurnId, updatedPlayer);

    const newDiscard = [...roomData.discard, cardPlayed];

    return {
      ...roomData,
      discard: newDiscard,
      players: updatedPlayers,
    };
  })();

  const newGameData: GameData = (() => {
    const genericRoomUpdates: GameData = {
      ...roomDataWithCardPlayed.game,
      lastMoveDescription: null,
    };

    switch (cardPlayed) {
      case Card.Guard:
        return {
          ...genericRoomUpdates,
          cardPlayed,
          details: {
            card: null,
            chosenPlayerId: null,
            submitted: false,
          },
        };
      case Card.Baron:
        return {
          ...genericRoomUpdates,
          cardPlayed,
          details: {
            chosenPlayerId: null,
            winningPlayerId: null,
            submitted: false,
          },
        };
      case Card.Chancellor: {
        const deckOptions = roomDataWithCardPlayed.deck.slice(0, 2);
        return {
          ...genericRoomUpdates,
          cardPlayed,
          details: deckOptions
            ? {
              deckOptions: deckOptions,
              card: null,
              submitted: false,
            }
            : null,
        };
      }
      // SimplePlayerSelect
      case Card.Priest:
      case Card.Prince:
      case Card.King:
        return {
          ...genericRoomUpdates,
          cardPlayed,
          details: {
            chosenPlayerId: null,
            submitted: false,
          },
        };
      // No details needed
      case Card.Spy:
      case Card.Handmaid:
      case Card.Countess:
      case Card.Princess:
        return {
          ...genericRoomUpdates,
          cardPlayed,
          details: null,
        };
    }
  })();

  const updatedRoomData: RoomData = {
    ...roomDataWithCardPlayed,
    game: newGameData,
  };

  if (updatedRoomData.game.details === null) {
    // if there are no details to add, go ahead and play the card
    return handleSubmitSelection(roomCode, updatedRoomData);
  }

  Rooms.set(roomCode, updatedRoomData);

  return {
    deckCount: roomDataWithCardPlayed.deck.length,
    discard: roomDataWithCardPlayed.discard,
    players: Array.from(roomDataWithCardPlayed.players),
    game: newGameData,
  };
}

export function handleSelectPlayer(roomCode: string, room: RoomData, playerSelected: string): OutgoingGameStateUpdate {
  const roomCopy = structuredClone(room);

  if (!roomCopy.game.details || "chosenPlayerId" in roomCopy.game.details === false) {
    throw new Error(`Details didn't ask for chosenPlayerId. Game state: ${JSON.stringify(room.game)}`);
  }

  roomCopy.game.details.chosenPlayerId = playerSelected;
  Rooms.set(roomCode, roomCopy);

  return {
    deckCount: roomCopy.deck.length,
    discard: roomCopy.discard,
    game: roomCopy.game,
    players: Array.from(roomCopy.players),
  };
}

export function handleSelectCard(roomCode: string, room: RoomData, cardSelected: Card): OutgoingGameStateUpdate {
  if (!room.game.details || "card" in room.game.details === false) {
    throw new Error(`Did not ask for card selection.`);
  }

  let newGameData: GameData | null = null;

  if (room.game.cardPlayed === Card.Guard) {
    newGameData = {
      ...room.game,
      details: {
        ...room.game.details,
        card: cardSelected,
      },
    };
  } else if (room.game.cardPlayed === Card.Chancellor) {
    newGameData = {
      ...room.game,
      details: {
        ...room.game.details,
        card: cardSelected,
      },
    };
  } else {
    throw new Error(`Card selection wasn't for a Guard or Chancellor.`);
  }

  const updatedRoomData: RoomData = {
    ...room,
    game: newGameData,
  };

  Rooms.set(roomCode, updatedRoomData);

  return {
    deckCount: updatedRoomData.deck.length,
    discard: updatedRoomData.discard,
    game: updatedRoomData.game,
    players: Array.from(updatedRoomData.players),
  };
}

export function handleSubmitSelection(roomCode: string, room: RoomData): OutgoingGameStateUpdate {
  switch (room.game.cardPlayed) {
    case Card.Spy:
      return cardActionHandlers.handlePlayedSpy(roomCode, room);
    case Card.Guard:
      return cardActionHandlers.handlePlayedGuard(roomCode, room);
    case Card.Priest:
      return cardActionHandlers.handlePlayedPriest(roomCode, room);
    case Card.Baron:
      return cardActionHandlers.handlePlayedBaron(roomCode, room);
    case Card.Handmaid:
      return cardActionHandlers.handlePlayedHandmaid(roomCode, room);
    case Card.Prince:
      return cardActionHandlers.handlePlayedPrince(roomCode, room);
    case Card.Chancellor:
      return cardActionHandlers.handlePlayedChancellor(roomCode, room);
    default:
      throw new Error(`Action not yet implemented for ${room.game.cardPlayed}.`);
  }
}

export function handleAcknowledgeAction(roomCode: string, room: RoomData): OutgoingGameStateUpdate {
  let updatedRoomData = room;

  if (room.game.cardPlayed === Card.Baron) {
    const losingplayerId = room.game.details.winningPlayerId === room.game.playerTurnId
      ? room.game.details.chosenPlayerId
      : room.game.playerTurnId;
    if (!losingplayerId) {
      throw new Error(`No losing player to update ?`);
    }

    updatedRoomData = knockPlayerOutOfRound(room, losingplayerId);
  }

  const roomDataForNextTurn = prepRoomDataForNextTurn(updatedRoomData);
  Rooms.set(roomCode, roomDataForNextTurn);

  return {
    deckCount: roomDataForNextTurn.deck.length,
    discard: roomDataForNextTurn.discard,
    game: roomDataForNextTurn.game,
    players: Array.from(roomDataForNextTurn.players),
  };
}

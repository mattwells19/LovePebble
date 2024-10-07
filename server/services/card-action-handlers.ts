import { Rooms } from "../repositories/Rooms.ts";
import type { OutgoingGameStateUpdate } from "../types/socket.types.ts";
import {
  Card,
  type GameStarted,
  type PlayedBaron,
  type PlayedGuard,
  type PlayedHandmaid,
  type PlayedPriest,
  type PlayedSpy,
  type PlayerId,
  type RoomData,
} from "../types/types.ts";
import { updatePlayer, prepRoomDataForNextTurn, knockPlayerOutOfRound } from "./gameFlow.ts";
import * as validators from "./validators.ts";

export function handlePlayedSpy(roomCode: string, roomData: RoomData): OutgoingGameStateUpdate {
  const playingPlayer = validators.validatePlayerExists(roomData, roomData.game.playerTurnId);
  const gameData = roomData.game as GameStarted & PlayedSpy;

  const updatedPlayers = updatePlayer(roomData.players, gameData.playerTurnId, { playedSpy: true });

  const updatedRoomData: RoomData = {
    deck: roomData.deck,
    discard: roomData.discard,
    players: updatedPlayers,
    game: {
      ...gameData,
      lastMoveDescription: `${playingPlayer.name} played the Spy!`,
    },
  };

  const roomDataForNextTurn = prepRoomDataForNextTurn(updatedRoomData);
  Rooms.set(roomCode, roomDataForNextTurn);

  return {
    deckCount: roomDataForNextTurn.deck.length,
    discard: roomDataForNextTurn.discard,
    game: roomDataForNextTurn.game,
    players: Array.from(roomDataForNextTurn.players),
  };
}

export function handlePlayedGuard(roomCode: string, roomData: RoomData): OutgoingGameStateUpdate {
  const playingPlayer = validators.validatePlayerExists(roomData, roomData.game.playerTurnId);
  const [playerIdBeingGuessed, playerBeingGuessed] = validators.validatePlayerSelection(roomData, Card.Guard);
  const gameData = roomData.game as GameStarted & PlayedGuard;

  let updatedRoomData: RoomData | null = null;

  const cardGuessed = gameData.details.card;
  if (cardGuessed === null) {
    throw new Error(`Didn't guess a card when processing Guard action.`);
  }
  if (playerBeingGuessed.cards.includes(cardGuessed)) {
    // guessed correctly
    updatedRoomData = knockPlayerOutOfRound(roomData, playerIdBeingGuessed);

    updatedRoomData = {
      deck: updatedRoomData.deck,
      discard: updatedRoomData.discard,
      players: updatedRoomData.players,
      game: {
        ...gameData,
        lastMoveDescription: `${playingPlayer.name} played the Guard, guessed that ${playerBeingGuessed.name} had a ${cardGuessed} and was correct! ${playerBeingGuessed.name} is out of the round.`,
      },
    };
  } else {
    // guessed incorrectly
    updatedRoomData = {
      deck: roomData.deck,
      discard: roomData.discard,
      players: roomData.players,
      game: {
        ...gameData,
        lastMoveDescription: `${playingPlayer.name} played the Guard, guessed that ${playerBeingGuessed.name} had a ${cardGuessed} and was incorrect.`,
      },
    };
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

export function handlePlayedPriest(roomCode: string, roomData: RoomData): OutgoingGameStateUpdate {
  const playingPlayer = validators.validatePlayerExists(roomData, roomData.game.playerTurnId);
  const [, playerBeingLookedAt] = validators.validatePlayerSelection(roomData, Card.Priest);
  const gameData = roomData.game as GameStarted & PlayedPriest;

  const updatedRoomData: RoomData = {
    deck: roomData.deck,
    discard: roomData.discard,
    players: roomData.players,
    game: {
      ...gameData,
      details: {
        ...gameData.details,
        submitted: true,
      },
      lastMoveDescription: `${playingPlayer.name} played the Priest and decided to look at ${playerBeingLookedAt.name}'s card.`,
    },
  };

  // don't prepRoomDataForNextTurn since Priest requries an Acknowledge action
  Rooms.set(roomCode, updatedRoomData);

  return {
    deckCount: updatedRoomData.deck.length,
    discard: updatedRoomData.discard,
    game: updatedRoomData.game,
    players: Array.from(updatedRoomData.players),
  };
}

export function handlePlayedBaron(roomCode: string, roomData: RoomData): OutgoingGameStateUpdate {
  const playingPlayer = validators.validatePlayerExists(roomData, roomData.game.playerTurnId);
  const [playerIdBeingChallenged, playerBeingChallenged] = validators.validatePlayerSelection(roomData, Card.Baron);
  const gameData = roomData.game as GameStarted & PlayedBaron;

  const winningPlayerId: PlayerId | null = (() => {
    const currentPlayersCard = playingPlayer.cards[0];
    const challengedPlayersCard = playerBeingChallenged.cards[0];

    if (currentPlayersCard > challengedPlayersCard) {
      return gameData.playerTurnId;
    } else if (challengedPlayersCard > currentPlayersCard) {
      return playerIdBeingChallenged;
    } else {
      return null;
    }
  })();

  const resultText = (() => {
    if (winningPlayerId === gameData.playerTurnId) {
      return `${playingPlayer.name} wins the challenge! ${playerBeingChallenged.name} is out of the round.`;
    } else if (winningPlayerId === playerIdBeingChallenged) {
      return `${playingPlayer.name} lost the challenge and is out of the round.`;
    } else {
      return "The result is a tie! Both players remain in the round.";
    }
  })();

  const updatedRoomData: RoomData = {
    deck: roomData.deck,
    discard: roomData.discard,
    players: roomData.players,
    game: {
      ...gameData,
      details: {
        ...gameData.details,
        winningPlayerId,
        submitted: true,
      },
      lastMoveDescription: `${playingPlayer.name} played the Baron and challenged ${playerBeingChallenged.name}. ${resultText}`,
    },
  };

  // don't prepRoomDataForNextTurn since Baron requries an Acknowledge action
  Rooms.set(roomCode, updatedRoomData);

  return {
    deckCount: updatedRoomData.deck.length,
    discard: updatedRoomData.discard,
    game: updatedRoomData.game,
    players: Array.from(updatedRoomData.players),
  };
}

export function handlePlayedHandmaid(roomCode: string, roomData: RoomData): OutgoingGameStateUpdate {
  const playingPlayer = validators.validatePlayerExists(roomData, roomData.game.playerTurnId);
  const gameData = roomData.game as GameStarted & PlayedHandmaid;

  const updatedPlayers = updatePlayer(roomData.players, gameData.playerTurnId, { handmaidProtected: true });

  const updatedRoomData: RoomData = {
    deck: roomData.deck,
    discard: roomData.discard,
    players: updatedPlayers,
    game: {
      ...gameData,
      lastMoveDescription: `${playingPlayer.name} played the Handmaind. Hands off!`,
    },
  };

  const roomDataForNextTurn = prepRoomDataForNextTurn(updatedRoomData);
  Rooms.set(roomCode, roomDataForNextTurn);

  return {
    deckCount: roomDataForNextTurn.deck.length,
    discard: roomDataForNextTurn.discard,
    game: roomDataForNextTurn.game,
    players: Array.from(roomDataForNextTurn.players),
  };
}

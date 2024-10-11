import { Rooms } from "../repositories/Rooms.ts";
import type { OutgoingGameStateUpdate } from "../types/socket.types.ts";
import {
  Card,
  type GameStarted,
  type PlayedBaron,
  type PlayedChancellor,
  type PlayedCountess,
  type PlayedGuard,
  type PlayedHandmaid,
  type PlayedKing,
  type PlayedPriest,
  type PlayedPrince,
  type PlayedPrincess,
  type PlayedSpy,
  type PlayerId,
  type RoomData,
} from "../types/types.ts";
import { drawCardFromDeck, knockPlayerOutOfRound, prepRoomDataForNextTurn, updatePlayer } from "./gameFlow.ts";
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

  if (playerIdBeingGuessed && playerBeingGuessed) {
    const cardGuessed = gameData.details.card;
    if (cardGuessed === null) {
      throw new Error(`Didn't guess a card when processing Guard action.`);
    }
    if (cardGuessed === Card.Guard) {
      throw new Error(`Can't guess a Guard when playing Guard.`);
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
          lastMoveDescription:
            `${playingPlayer.name} played the Guard, guessed that ${playerBeingGuessed.name} had a ${cardGuessed} and was correct! ${playerBeingGuessed.name} is out of the round.`,
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
          lastMoveDescription:
            `${playingPlayer.name} played the Guard, guessed that ${playerBeingGuessed.name} had a ${cardGuessed} and was incorrect.`,
        },
      };
    }
  } else {
    // no options to guess
    updatedRoomData = {
      deck: roomData.deck,
      discard: roomData.discard,
      players: roomData.players,
      game: {
        ...gameData,
        lastMoveDescription:
          `${playingPlayer.name} played the Guard, but there were no players to select so the card has no effect.`,
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

  let updatedRoomData: RoomData | null = null;

  if (playerBeingLookedAt) {
    updatedRoomData = {
      deck: roomData.deck,
      discard: roomData.discard,
      players: roomData.players,
      game: {
        ...gameData,
        details: {
          ...gameData.details,
          submitted: true,
        },
        lastMoveDescription:
          `${playingPlayer.name} played the Priest and decided to look at ${playerBeingLookedAt.name}'s card.`,
      },
    };
  } else {
    updatedRoomData = {
      deck: roomData.deck,
      discard: roomData.discard,
      players: roomData.players,
      game: {
        ...gameData,
        lastMoveDescription:
          `${playingPlayer.name} played the Priest, but there were no players to select so the card has no effect.`,
      },
    };

    updatedRoomData = prepRoomDataForNextTurn(updatedRoomData);
  }

  // don't prepRoomDataForNextTurn if selections were made since Priest requries an Acknowledge action
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

  let updatedRoomData: RoomData | null = null;

  if (playerIdBeingChallenged && playerBeingChallenged) {
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

    updatedRoomData = {
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
        lastMoveDescription:
          `${playingPlayer.name} played the Baron and challenged ${playerBeingChallenged.name}. ${resultText}`,
      },
    };
  } else {
    updatedRoomData = {
      deck: roomData.deck,
      discard: roomData.discard,
      players: roomData.players,
      game: {
        ...gameData,
        lastMoveDescription:
          `${playingPlayer.name} played the Baron, but there were no players to challenge so the card has no effect.`,
      },
    };

    updatedRoomData = prepRoomDataForNextTurn(updatedRoomData);
  }

  // don't prepRoomDataForNextTurn if selections were made since Baron requries an Acknowledge action
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

export function handlePlayedPrince(roomCode: string, roomData: RoomData): OutgoingGameStateUpdate {
  const playingPlayer = validators.validatePlayerExists(roomData, roomData.game.playerTurnId);
  const [chosenPlayerId, chosenPlayer] = validators.validatePlayerSelection(roomData, Card.Prince);
  const gameData = roomData.game as GameStarted & PlayedPrince;

  let updatedRoomData: RoomData | null = null;

  if (chosenPlayerId && chosenPlayer) {
    const cardToDiscard = chosenPlayer.cards[0];

    if (cardToDiscard === Card.Princess) {
      // knockPlayerOutOfRound will handle placing the card into the discard
      updatedRoomData = knockPlayerOutOfRound(roomData, chosenPlayerId);

      updatedRoomData = {
        deck: updatedRoomData.deck,
        discard: updatedRoomData.discard,
        players: updatedRoomData.players,
        game: {
          ...gameData,
          lastMoveDescription:
            `${playingPlayer.name} played the Prince, and made ${chosenPlayer.name} discard their Princess! ${chosenPlayer.name} is out of the round.`,
        },
      };
    } else {
      const { newDeck, cardDrawn } = drawCardFromDeck(roomData.deck);
      let updatedDiscard = [...roomData.discard, cardToDiscard];

      const newCard = (() => {
        if (cardDrawn) return cardDrawn;

        // if the deck is empty you can pull the first auto-discarded card to use for end of game
        const cardFromDiscard = roomData.discard[0];
        updatedDiscard = updatedDiscard.slice(1);
        return cardFromDiscard;
      })();

      const updatedPlayers = updatePlayer(roomData.players, chosenPlayerId, {
        cards: [newCard],
        // discarding the Spy counts as "playing" the Spy per the rules
        playedSpy: cardToDiscard === Card.Spy ? true : chosenPlayer.playedSpy,
      });

      const choseThemself = roomData.game.playerTurnId === chosenPlayerId;

      updatedRoomData = {
        deck: newDeck,
        discard: updatedDiscard,
        players: updatedPlayers,
        game: {
          ...gameData,
          lastMoveDescription: `${playingPlayer.name} played the Prince, and made ${
            choseThemself ? "themselves" : chosenPlayer.name
          } discard their ${cardToDiscard}.`,
        },
      };
    }
  } else {
    updatedRoomData = {
      deck: roomData.deck,
      discard: roomData.discard,
      players: roomData.players,
      game: {
        ...gameData,
        lastMoveDescription:
          `${playingPlayer.name} played the Prince, but there were no players to choose so the card has no effect.`,
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

export function handlePlayedChancellor(roomCode: string, roomData: RoomData): OutgoingGameStateUpdate {
  const playingPlayer = validators.validatePlayerExists(roomData, roomData.game.playerTurnId);
  const gameData = roomData.game as GameStarted & PlayedChancellor;

  let updatedRoomData: RoomData | null = null;

  // details will be null if there were no deck options to choose from.
  // in that case this card should have no effect

  if (gameData.details) {
    const cardOptions = [...gameData.details.deckOptions, ...playingPlayer.cards];

    const chosenCard = gameData.details.card;
    if (chosenCard === null) {
      throw new Error(`Didn't choose a card when processing Chancellor action.`);
    }
    if (!cardOptions.includes(chosenCard)) {
      throw new Error(`Chosen card was not one of the options. ${chosenCard} - ${cardOptions.join(", ")}`);
    }

    let newDeck = [...roomData.deck];
    if (gameData.details.deckOptions.includes(chosenCard)) {
      // if they chose a card from the deck, remove the chosen card and add the card from their hand
      const cardDeckIndex = newDeck.indexOf(chosenCard);
      newDeck = newDeck.toSpliced(cardDeckIndex, 1, playingPlayer.cards[0]);
    }

    const updatedPlayers = updatePlayer(roomData.players, gameData.playerTurnId, { cards: [chosenCard] });

    updatedRoomData = {
      deck: newDeck,
      discard: roomData.discard,
      players: updatedPlayers,
      game: {
        ...gameData,
        lastMoveDescription: `${playingPlayer.name} played the Chancellor.`,
      },
    };
  } else {
    updatedRoomData = {
      deck: roomData.deck,
      discard: roomData.discard,
      players: roomData.players,
      game: {
        ...gameData,
        lastMoveDescription: `${playingPlayer.name} played the Chancellor. The deck was empty so there is no effect.`,
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

export function handlePlayedKing(roomCode: string, roomData: RoomData): OutgoingGameStateUpdate {
  const playingPlayer = validators.validatePlayerExists(roomData, roomData.game.playerTurnId);
  const [chosenPlayerId, chosenPlayer] = validators.validatePlayerSelection(roomData, Card.King);
  const gameData = roomData.game as GameStarted & PlayedKing;

  let updatedRoomData: RoomData | null = null;

  if (chosenPlayerId && chosenPlayer) {
    const playerCards = playingPlayer.cards;
    const chosenPlayerCards = chosenPlayer.cards;

    let updatedPlayers = updatePlayer(roomData.players, roomData.game.playerTurnId, { cards: chosenPlayerCards });
    updatedPlayers = updatePlayer(updatedPlayers, chosenPlayerId, { cards: playerCards });

    updatedRoomData = {
      deck: roomData.deck,
      discard: roomData.discard,
      players: updatedPlayers,
      game: {
        ...gameData,
        lastMoveDescription:
          `${playingPlayer.name} played the King and decided to swap cards with ${chosenPlayer.name}.`,
      },
    };
  } else {
    updatedRoomData = {
      deck: roomData.deck,
      discard: roomData.discard,
      players: roomData.players,
      game: {
        ...gameData,
        lastMoveDescription:
          `${playingPlayer.name} played the King, but there were no players to select so the card has no effect.`,
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

export function handlePlayedCountess(roomCode: string, roomData: RoomData): OutgoingGameStateUpdate {
  const playingPlayer = validators.validatePlayerExists(roomData, roomData.game.playerTurnId);
  const gameData = roomData.game as GameStarted & PlayedCountess;

  const updatedRoomData: RoomData = {
    deck: roomData.deck,
    discard: roomData.discard,
    players: roomData.players,
    game: {
      ...gameData,
      lastMoveDescription: `Oooooo, ${playingPlayer.name} played the Countess!`,
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

export function handlePlayedPrincess(roomCode: string, roomData: RoomData): OutgoingGameStateUpdate {
  const playingPlayer = validators.validatePlayerExists(roomData, roomData.game.playerTurnId);
  const gameData = roomData.game as GameStarted & PlayedPrincess;

  let updatedRoomData = knockPlayerOutOfRound(roomData, roomData.game.playerTurnId);

  updatedRoomData = {
    deck: updatedRoomData.deck,
    discard: updatedRoomData.discard,
    players: updatedRoomData.players,
    game: {
      ...gameData,
      lastMoveDescription: `${playingPlayer.name} played the Princess so they are out of the round!`,
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

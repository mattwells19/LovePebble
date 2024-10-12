import {
  Card,
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
  type RoundStarted,
} from "../types/types.ts";
import { drawCardFromDeck, knockPlayerOutOfRound, prepRoomDataForNextTurn, updatePlayer } from "./gameFlow.ts";
import * as validators from "./validators.ts";

export function handlePlayedSpy(roomData: RoomData): RoomData {
  const roundData = validators.validateRoundStarted<RoundStarted & PlayedSpy>(roomData);

  const playingPlayer = validators.validatePlayerExists(roomData, roundData.playerTurnId);

  const updatedPlayers = updatePlayer(roomData.players, roundData.playerTurnId, { playedSpy: true });

  const updatedRoomData: RoomData = {
    ...roomData,
    players: updatedPlayers,
    round: roundData,
    roundLog: [...roomData.roundLog, `${playingPlayer.name} played the Spy!`],
  };

  return prepRoomDataForNextTurn(updatedRoomData);
}

export function handlePlayedGuard(roomData: RoomData): RoomData {
  const roundData = validators.validateRoundStarted<RoundStarted & PlayedGuard>(roomData);

  const playingPlayer = validators.validatePlayerExists(roomData, roundData.playerTurnId);
  const [playerIdBeingGuessed, playerBeingGuessed] = validators.validatePlayerSelection(roomData, Card.Guard);

  let updatedRoomData: RoomData | null = null;

  if (playerIdBeingGuessed && playerBeingGuessed) {
    const cardGuessed = roundData.details.card;
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
        ...updatedRoomData,
        round: roundData,
        roundLog: [
          ...updatedRoomData.roundLog,
          `${playingPlayer.name} played the Guard, guessed that ${playerBeingGuessed.name} had a ${cardGuessed} and was correct! ${playerBeingGuessed.name} is out of the round.`,
        ],
      };
    } else {
      // guessed incorrectly
      updatedRoomData = {
        ...roomData,
        round: roundData,
        roundLog: [
          ...roomData.roundLog,
          `${playingPlayer.name} played the Guard, guessed that ${playerBeingGuessed.name} had a ${cardGuessed} and was incorrect.`,
        ],
      };
    }
  } else {
    // no options to guess
    updatedRoomData = {
      ...roomData,
      round: roundData,
      roundLog: [
        ...roomData.roundLog,
        `${playingPlayer.name} played the Guard, but there were no players to select so the card has no effect.`,
      ],
    };
  }

  return prepRoomDataForNextTurn(updatedRoomData);
}

export function handlePlayedPriest(roomData: RoomData): RoomData {
  const roundData = validators.validateRoundStarted<RoundStarted & PlayedPriest>(roomData);

  const playingPlayer = validators.validatePlayerExists(roomData, roundData.playerTurnId);
  const [, playerBeingLookedAt] = validators.validatePlayerSelection(roomData, Card.Priest);

  let updatedRoomData: RoomData | null = null;

  if (playerBeingLookedAt) {
    updatedRoomData = {
      ...roomData,
      round: {
        ...roundData,
        details: {
          ...roundData.details,
          submitted: true,
        },
      },
      roundLog: [
        ...roomData.roundLog,
        `${playingPlayer.name} played the Priest and decided to look at ${playerBeingLookedAt.name}'s card.`,
      ],
    };
  } else {
    updatedRoomData = {
      ...roomData,
      round: roundData,
      roundLog: [
        ...roomData.roundLog,
        `${playingPlayer.name} played the Priest, but there were no players to select so the card has no effect.`,
      ],
    };

    updatedRoomData = prepRoomDataForNextTurn(updatedRoomData);
  }

  // don't prepRoomDataForNextTurn if selections were made since Priest requries an Acknowledge action
  return updatedRoomData;
}

export function handlePlayedBaron(roomData: RoomData): RoomData {
  const roundData = validators.validateRoundStarted<RoundStarted & PlayedBaron>(roomData);

  const playingPlayer = validators.validatePlayerExists(roomData, roundData.playerTurnId);
  const [playerIdBeingChallenged, playerBeingChallenged] = validators.validatePlayerSelection(roomData, Card.Baron);

  let updatedRoomData: RoomData | null = null;

  if (playerIdBeingChallenged && playerBeingChallenged) {
    const winningPlayerId: PlayerId | null = (() => {
      const currentPlayersCard = playingPlayer.cards[0];
      const challengedPlayersCard = playerBeingChallenged.cards[0];

      if (currentPlayersCard > challengedPlayersCard) {
        return roundData.playerTurnId;
      } else if (challengedPlayersCard > currentPlayersCard) {
        return playerIdBeingChallenged;
      } else {
        return null;
      }
    })();

    const resultText = (() => {
      if (winningPlayerId === roundData.playerTurnId) {
        return `${playingPlayer.name} wins the challenge! ${playerBeingChallenged.name} is out of the round.`;
      } else if (winningPlayerId === playerIdBeingChallenged) {
        return `${playingPlayer.name} lost the challenge and is out of the round.`;
      } else {
        return "The result is a tie! Both players remain in the round.";
      }
    })();

    updatedRoomData = {
      ...roomData,
      round: {
        ...roundData,
        details: {
          ...roundData.details,
          winningPlayerId,
          submitted: true,
        },
      },
      roundLog: [
        ...roomData.roundLog,
        `${playingPlayer.name} played the Baron and challenged ${playerBeingChallenged.name}. ${resultText}`,
      ],
    };
  } else {
    updatedRoomData = {
      ...roomData,
      round: roundData,
      roundLog: [
        ...roomData.roundLog,
        `${playingPlayer.name} played the Baron, but there were no players to challenge so the card has no effect.`,
      ],
    };

    updatedRoomData = prepRoomDataForNextTurn(updatedRoomData);
  }

  // don't prepRoomDataForNextTurn if selections were made since Baron requries an Acknowledge action
  return updatedRoomData;
}

export function handlePlayedHandmaid(roomData: RoomData): RoomData {
  const roundData = validators.validateRoundStarted<RoundStarted & PlayedHandmaid>(roomData);

  const playingPlayer = validators.validatePlayerExists(roomData, roundData.playerTurnId);

  const updatedPlayers = updatePlayer(roomData.players, roundData.playerTurnId, { handmaidProtected: true });

  const updatedRoomData: RoomData = {
    ...roomData,
    players: updatedPlayers,
    round: roundData,
    roundLog: [...roomData.roundLog, `${playingPlayer.name} played the Handmaind. Hands off!`],
  };

  return prepRoomDataForNextTurn(updatedRoomData);
}

export function handlePlayedPrince(roomData: RoomData): RoomData {
  const roundData = validators.validateRoundStarted<RoundStarted & PlayedPrince>(roomData);

  const playingPlayer = validators.validatePlayerExists(roomData, roundData.playerTurnId);
  const [chosenPlayerId, chosenPlayer] = validators.validatePlayerSelection(roomData, Card.Prince);

  let updatedRoomData: RoomData | null = null;

  if (chosenPlayerId && chosenPlayer) {
    const cardToDiscard = chosenPlayer.cards[0];

    if (cardToDiscard === Card.Princess) {
      // knockPlayerOutOfRound will handle placing the card into the discard
      updatedRoomData = knockPlayerOutOfRound(roomData, chosenPlayerId);

      updatedRoomData = {
        ...updatedRoomData,
        round: roundData,
        roundLog: [
          ...updatedRoomData.roundLog,
          `${playingPlayer.name} played the Prince, and made ${chosenPlayer.name} discard their Princess! ${chosenPlayer.name} is out of the round.`,
        ],
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

      const choseThemself = roundData.playerTurnId === chosenPlayerId;

      updatedRoomData = {
        ...roomData,
        deck: newDeck,
        discard: updatedDiscard,
        players: updatedPlayers,
        round: roundData,
        roundLog: [
          ...roomData.roundLog,
          `${playingPlayer.name} played the Prince, and made ${
            choseThemself ? "themselves" : chosenPlayer.name
          } discard their ${cardToDiscard}.`,
        ],
      };
    }
  } else {
    updatedRoomData = {
      ...roomData,
      round: roundData,
      roundLog: [
        ...roomData.roundLog,
        `${playingPlayer.name} played the Prince, but there were no players to choose so the card has no effect.`,
      ],
    };
  }

  return prepRoomDataForNextTurn(updatedRoomData);
}

export function handlePlayedChancellor(roomData: RoomData): RoomData {
  const roundData = validators.validateRoundStarted<RoundStarted & PlayedChancellor>(roomData);

  const playingPlayer = validators.validatePlayerExists(roomData, roundData.playerTurnId);

  let updatedRoomData: RoomData | null = null;

  // details will be null if there were no deck options to choose from.
  // in that case this card should have no effect

  if (roundData.details) {
    const cardOptions = [...roundData.details.deckOptions, ...playingPlayer.cards];

    const chosenCard = roundData.details.card;
    if (chosenCard === null) {
      throw new Error(`Didn't choose a card when processing Chancellor action.`);
    }
    if (!cardOptions.includes(chosenCard)) {
      throw new Error(`Chosen card was not one of the options. ${chosenCard} - ${cardOptions.join(", ")}`);
    }

    let newDeck = [...roomData.deck];
    if (roundData.details.deckOptions.includes(chosenCard)) {
      // if they chose a card from the deck, remove the chosen card and add the card from their hand
      const cardDeckIndex = newDeck.indexOf(chosenCard);
      newDeck = newDeck.toSpliced(cardDeckIndex, 1, playingPlayer.cards[0]);
    }

    const updatedPlayers = updatePlayer(roomData.players, roundData.playerTurnId, { cards: [chosenCard] });

    updatedRoomData = {
      ...roomData,
      deck: newDeck,
      players: updatedPlayers,
      round: roundData,
      roundLog: [...roomData.roundLog, `${playingPlayer.name} played the Chancellor.`],
    };
  } else {
    updatedRoomData = {
      ...roomData,
      round: roundData,
      roundLog: [
        ...roomData.roundLog,
        `${playingPlayer.name} played the Chancellor. The deck was empty so there is no effect.`,
      ],
    };
  }

  return prepRoomDataForNextTurn(updatedRoomData);
}

export function handlePlayedKing(roomData: RoomData): RoomData {
  const roundData = validators.validateRoundStarted<RoundStarted & PlayedKing>(roomData);

  const playingPlayer = validators.validatePlayerExists(roomData, roundData.playerTurnId);
  const [chosenPlayerId, chosenPlayer] = validators.validatePlayerSelection(roomData, Card.King);

  let updatedRoomData: RoomData | null = null;

  if (chosenPlayerId && chosenPlayer) {
    const playerCards = playingPlayer.cards;
    const chosenPlayerCards = chosenPlayer.cards;

    let updatedPlayers = updatePlayer(roomData.players, roundData.playerTurnId, { cards: chosenPlayerCards });
    updatedPlayers = updatePlayer(updatedPlayers, chosenPlayerId, { cards: playerCards });

    updatedRoomData = {
      ...roomData,
      players: updatedPlayers,
      round: roundData,
      roundLog: [
        ...roomData.roundLog,
        `${playingPlayer.name} played the King and decided to swap cards with ${chosenPlayer.name}.`,
      ],
    };
  } else {
    updatedRoomData = {
      ...roomData,
      round: roundData,
      roundLog: [
        ...roomData.roundLog,
        `${playingPlayer.name} played the King, but there were no players to select so the card has no effect.`,
      ],
    };
  }

  return prepRoomDataForNextTurn(updatedRoomData);
}

export function handlePlayedCountess(roomData: RoomData): RoomData {
  const roundData = validators.validateRoundStarted<RoundStarted & PlayedCountess>(roomData);

  const playingPlayer = validators.validatePlayerExists(roomData, roundData.playerTurnId);

  const updatedRoomData: RoomData = {
    ...roomData,
    round: roundData,
    roundLog: [...roomData.roundLog, `Oooooo, ${playingPlayer.name} played the Countess!`],
  };

  return prepRoomDataForNextTurn(updatedRoomData);
}

export function handlePlayedPrincess(roomData: RoomData): RoomData {
  const roundData = validators.validateRoundStarted<RoundStarted & PlayedPrincess>(roomData);

  const playingPlayer = validators.validatePlayerExists(roomData, roundData.playerTurnId);

  let updatedRoomData = knockPlayerOutOfRound(roomData, roundData.playerTurnId);

  updatedRoomData = {
    ...updatedRoomData,
    round: roundData,
    roundLog: [...roomData.roundLog, `${playingPlayer.name} played the Princess so they are out of the round!`],
  };

  return prepRoomDataForNextTurn(updatedRoomData);
}

import { prepRoomDataForNextTurn, updatePlayer } from "../utils/mod.ts";
import type { PlayedChancellor, RoomData, RoundStarted } from "../../types/types.ts";
import { validatePlayerExists, validateRoundStarted } from "../../validators/mod.ts";

export function playedChancellor(roomData: RoomData): RoomData {
  const roundData = validateRoundStarted<RoundStarted & PlayedChancellor>(roomData);

  const playingPlayer = validatePlayerExists(roomData, roundData.playerTurnId);

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

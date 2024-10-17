import {
  drawCardFromDeck,
  knockPlayerOutOfRound,
  LOG_MESSAGES,
  prepRoomDataForNextTurn,
  updatePlayer,
} from "../utils/mod.ts";
import { Card, type PlayedPrince, type RoomData, type RoundStarted } from "../../types/types.ts";
import { validatePlayerExists, validatePlayerSelection, validateRoundStarted } from "../../validators/mod.ts";

export function playedPrince(roomData: RoomData): RoomData {
  const roundData = validateRoundStarted<RoundStarted & PlayedPrince>(roomData);

  const playingPlayer = validatePlayerExists(roomData, roundData.playerTurnId);
  const [chosenPlayerId, chosenPlayer] = validatePlayerSelection(roomData, Card.Prince);

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
          LOG_MESSAGES.prince.discardPrincess(playingPlayer.name, chosenPlayer.name),
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
          choseThemself
            ? LOG_MESSAGES.prince.discardThemself(playingPlayer.name, cardToDiscard)
            : LOG_MESSAGES.prince.discardOther(playingPlayer.name, chosenPlayer.name, cardToDiscard),
        ],
      };
    }
  } else {
    updatedRoomData = {
      ...roomData,
      round: roundData,
      roundLog: [
        ...roomData.roundLog,
        LOG_MESSAGES.prince.noEffect(playingPlayer.name),
      ],
    };
  }

  return prepRoomDataForNextTurn(updatedRoomData);
}

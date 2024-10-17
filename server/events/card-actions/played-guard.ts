import { knockPlayerOutOfRound, LOG_MESSAGES, prepRoomDataForNextTurn } from "../utils/mod.ts";
import { Card, type PlayedGuard, type RoomData, type RoundStarted } from "../../types/types.ts";
import { validatePlayerExists, validatePlayerSelection, validateRoundStarted } from "../../validators/mod.ts";

export function playedGuard(roomData: RoomData): RoomData {
  const roundData = validateRoundStarted<RoundStarted & PlayedGuard>(roomData);

  const playingPlayer = validatePlayerExists(roomData, roundData.playerTurnId);
  const [playerIdBeingGuessed, playerBeingGuessed] = validatePlayerSelection(roomData, Card.Guard);

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
          LOG_MESSAGES.guard.guessedCorrect(playingPlayer.name, playerBeingGuessed.name, cardGuessed),
        ],
      };
    } else {
      // guessed incorrectly
      updatedRoomData = {
        ...roomData,
        round: roundData,
        roundLog: [
          ...roomData.roundLog,
          LOG_MESSAGES.guard.guessedWrong(playingPlayer.name, playerBeingGuessed.name, cardGuessed),
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
        LOG_MESSAGES.guard.noEffect(playingPlayer.name),
      ],
    };
  }

  return prepRoomDataForNextTurn(updatedRoomData);
}

import { knockPlayerOutOfRound, prepRoomDataForNextTurn } from "../utils/mod.ts";
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

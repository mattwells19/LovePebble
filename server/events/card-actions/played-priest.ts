import { LOG_MESSAGES, prepRoomDataForNextTurn } from "../utils/mod.ts";
import { Card, type PlayedPriest, type RoomData, type RoundStarted } from "../../types/types.ts";
import { validatePlayerExists, validatePlayerSelection, validateRoundStarted } from "../../validators/mod.ts";

export function playedPriest(roomData: RoomData): RoomData {
  const roundData = validateRoundStarted<RoundStarted & PlayedPriest>(roomData);

  const playingPlayer = validatePlayerExists(roomData, roundData.playerTurnId);
  const [, playerBeingLookedAt] = validatePlayerSelection(roomData, Card.Priest);

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
        LOG_MESSAGES.priest.peak(playingPlayer.name, playerBeingLookedAt.name),
      ],
    };
  } else {
    updatedRoomData = {
      ...roomData,
      round: roundData,
      roundLog: [
        ...roomData.roundLog,
        LOG_MESSAGES.priest.noEffect(playingPlayer.name),
      ],
    };

    updatedRoomData = prepRoomDataForNextTurn(updatedRoomData);
  }

  // don't prepRoomDataForNextTurn if selections were made since Priest requries an Acknowledge action
  return updatedRoomData;
}

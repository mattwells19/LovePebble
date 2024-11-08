import { LOG_MESSAGES, prepRoomDataForNextTurn } from "../utils/mod.ts";
import type { PlayedCountess, RoomData, RoundStarted } from "../../types/types.ts";
import { validatePlayerExists, validateRoundStarted } from "../../validators/mod.ts";

export function playedCountess(roomData: RoomData): RoomData {
  const roundData = validateRoundStarted<RoundStarted & PlayedCountess>(roomData);

  const playingPlayer = validatePlayerExists(roomData, roundData.playerTurnId);

  const updatedRoomData: RoomData = {
    ...roomData,
    round: roundData,
    roundLog: [...roomData.roundLog, LOG_MESSAGES.countess(playingPlayer.name)],
  };

  return prepRoomDataForNextTurn(updatedRoomData);
}

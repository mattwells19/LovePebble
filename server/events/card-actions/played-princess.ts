import { knockPlayerOutOfRound, prepRoomDataForNextTurn } from "../utils/mod.ts";
import type { PlayedPrincess, RoomData, RoundStarted } from "../../types/types.ts";
import { validatePlayerExists, validateRoundStarted } from "../../validators/mod.ts";

export function playedPrincess(roomData: RoomData): RoomData {
  const roundData = validateRoundStarted<RoundStarted & PlayedPrincess>(roomData);

  const playingPlayer = validatePlayerExists(roomData, roundData.playerTurnId);

  let updatedRoomData = knockPlayerOutOfRound(roomData, roundData.playerTurnId);

  updatedRoomData = {
    ...updatedRoomData,
    round: roundData,
    roundLog: [...roomData.roundLog, `${playingPlayer.name} played the Princess so they are out of the round!`],
  };

  return prepRoomDataForNextTurn(updatedRoomData);
}

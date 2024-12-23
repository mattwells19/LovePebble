import type { PlayedSpy, RoomData, RoundStarted } from "../../types/types.ts";
import { LOG_MESSAGES, prepRoomDataForNextTurn, updatePlayer } from "../utils/mod.ts";
import { validatePlayerExists, validateRoundStarted } from "../../validators/mod.ts";

export function playedSpy(roomData: RoomData): RoomData {
  const roundData = validateRoundStarted<RoundStarted & PlayedSpy>(roomData);

  const playingPlayer = validatePlayerExists(roomData, roundData.playerTurnId);

  const updatedPlayers = updatePlayer(roomData.players, roundData.playerTurnId, { playedSpy: true });

  const updatedRoomData: RoomData = {
    ...roomData,
    players: updatedPlayers,
    round: roundData,
    roundLog: [...roomData.roundLog, LOG_MESSAGES.spy(playingPlayer.name)],
  };

  return prepRoomDataForNextTurn(updatedRoomData);
}

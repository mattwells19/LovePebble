import { prepRoomDataForNextTurn, updatePlayer } from "../utils/mod.ts";
import type { PlayedHandmaid, RoomData, RoundStarted } from "../../types/types.ts";
import { validatePlayerExists, validateRoundStarted } from "../../validators/mod.ts";

export function playedHandmaid(roomData: RoomData): RoomData {
  const roundData = validateRoundStarted<RoundStarted & PlayedHandmaid>(roomData);

  const playingPlayer = validatePlayerExists(roomData, roundData.playerTurnId);

  const updatedPlayers = updatePlayer(roomData.players, roundData.playerTurnId, { handmaidProtected: true });

  const updatedRoomData: RoomData = {
    ...roomData,
    players: updatedPlayers,
    round: roundData,
    roundLog: [...roomData.roundLog, `${playingPlayer.name} played the Handmaind. Hands off!`],
  };

  return prepRoomDataForNextTurn(updatedRoomData);
}

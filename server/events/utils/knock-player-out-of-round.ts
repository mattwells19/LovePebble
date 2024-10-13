import type { PlayerId, RoomData } from "../../types/types.ts";
import { validatePlayerExists } from "../../validators/mod.ts";
import { updatePlayer } from "./update-player.ts";

/**
 * @param roomData The current state of the Room
 * @param playerId The ID of the player to knock out of the current round
 * @returns The updated room state with the discard and player updated.
 */
export const knockPlayerOutOfRound = (roomData: RoomData, playerId: PlayerId): RoomData => {
  const player = validatePlayerExists(roomData, playerId);
  const newDiscard = [...roomData.discard, ...player.cards];
  const updatedPlayers = updatePlayer(roomData.players, playerId, { outOfRound: true, cards: [] });

  return {
    ...roomData,
    discard: newDiscard,
    players: updatedPlayers,
  };
};

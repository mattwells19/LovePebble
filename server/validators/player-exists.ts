import type { Player, PlayerId, RoomData } from "../types/types.ts";

export function validatePlayerExists(roomData: RoomData, playerId: PlayerId): Player {
  const player = roomData.players.get(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} disappeared.`);
  }
  return player;
}

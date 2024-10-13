import type { PlayerId, RoomData } from "../../types/types.ts";

/**
 * @param players The current Map of players in the Room
 * @param currentPlayerTurnId The current player ID for the Room
 * @returns The ID of the next valid player who can take a turn. Will return the `currentPlayerTurnId` if they're the only va;id player in the round.
 */
export function getNextPlayerTurnId(players: RoomData["players"], currentPlayerTurnId: PlayerId): PlayerId {
  const playerIds = Array.from(players.keys());
  const currentPlayerTurnIdIndex = playerIds.indexOf(currentPlayerTurnId);

  let newPlayerIdIndex = currentPlayerTurnIdIndex === playerIds.length - 1 ? 0 : currentPlayerTurnIdIndex + 1;

  while (players.get(playerIds.at(newPlayerIdIndex)!)!.outOfRound) {
    newPlayerIdIndex = newPlayerIdIndex === playerIds.length - 1 ? 0 : newPlayerIdIndex + 1;
  }

  return playerIds.at(newPlayerIdIndex)!;
}

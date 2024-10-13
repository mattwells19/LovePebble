import type { Player, PlayerId, RoomData } from "../../types/types.ts";

export function updatePlayer(
  players: RoomData["players"],
  playerId: PlayerId,
  playerUpdates: Partial<Player>,
): RoomData["players"] {
  const player = players.get(playerId);
  if (!player) throw new Error("Where'd this player go??");

  const updatedPlayers = new Map(players);

  updatedPlayers.set(
    playerId,
    {
      ...player,
      ...playerUpdates,
    } satisfies Player,
  );

  return updatedPlayers;
}

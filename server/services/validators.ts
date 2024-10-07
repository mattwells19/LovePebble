import type { Card, Player, PlayerId, RoomData } from "../types/types.ts";

export function validatePlayerExists(roomData: RoomData, playerId: PlayerId): Player {
  const player = roomData.players.get(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} disappeared.`);
  }
  return player;
}

/**
 *
 * @param roomData The current state of the room
 * @param card The card being validated
 * @returns The player ID and player object for the chosen player
 */
export function validatePlayerSelection(roomData: RoomData, card: Card): [PlayerId, Player] {
  if (roomData.game.cardPlayed !== card) {
    throw new Error(`Card played isn't a ${card}. Card played: ${roomData.game.cardPlayed}.`);
  }

  if (!roomData.game.details || "chosenPlayerId" in roomData.game.details === false) {
    throw new Error(`Did not ask for player selection. Game state: ${JSON.stringify(roomData.game)}`);
  }

  const chosenPlayerId = roomData.game.details.chosenPlayerId;
  if (!chosenPlayerId) {
    throw new Error(`Missing chosenPlayerId processing ${card} action.`);
  }

  if (roomData.game.playerTurnId === chosenPlayerId) {
    throw new Error(`You can't choose yourself when playing ${card}.`);
  }

  const chosenPlayer = validatePlayerExists(roomData, chosenPlayerId);

  if (chosenPlayer.handmaidProtected || chosenPlayer.outOfRound) {
    throw new Error(
      `Cannot choose someone who is handmaid protected or who's not in the round. Card: ${card}, Chosen player: ${JSON.stringify(chosenPlayer)}`,
    );
  }

  return [chosenPlayerId, chosenPlayer];
}

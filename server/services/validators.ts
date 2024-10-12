import { Card, type Player, type PlayerId, type RoomData, type RoundData } from "../types/types.ts";

export function validateRoundStarted<TRoundData extends RoundData = RoundData>(roomData: RoomData): TRoundData {
  if (roomData.round === null) {
    throw new Error("Round not started.");
  }
  return roomData.round as TRoundData;
}

export function validatePlayerExists(roomData: RoomData, playerId: PlayerId): Player {
  const player = roomData.players.get(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} disappeared.`);
  }
  return player;
}

/**
 * @param roomData The current state of the room
 * @param card The card being validated
 * @returns The player ID and player object for the chosen player
 */
export function validatePlayerSelection(roomData: RoomData, card: Card): [PlayerId, Player] | [null, null] {
  const roundData = validateRoundStarted(roomData);

  if (roundData.cardPlayed !== card) {
    throw new Error(`Card played isn't a ${card}. Card played: ${roundData.cardPlayed}.`);
  }

  if (!roundData.details || "chosenPlayerId" in roundData.details === false) {
    throw new Error(`Did not ask for player selection. Game state: ${JSON.stringify(roundData)}`);
  }

  const chosenPlayerId = roundData.details.chosenPlayerId;

  const choosablePlayerIds = roomData.players.entries().reduce((acc, [playerId, player]) => {
    if (player.outOfRound || player.handmaidProtected) {
      return acc;
    }
    if (playerId === roundData.playerTurnId && card !== Card.Prince) {
      return acc;
    }

    return [...acc, playerId];
  }, [] as Array<PlayerId>);

  if (chosenPlayerId && !choosablePlayerIds.includes(chosenPlayerId)) {
    throw new Error(`Not a valid player selection.`);
  }

  if (!chosenPlayerId) {
    if (choosablePlayerIds.length === 0) return [null, null];

    throw new Error(`Missing chosenPlayerId processing ${card} action.`);
  }

  const chosenPlayer = validatePlayerExists(roomData, chosenPlayerId);

  if (chosenPlayer.handmaidProtected || chosenPlayer.outOfRound) {
    throw new Error(
      `Cannot choose someone who is handmaid protected or who's not in the round. Card: ${card}, Chosen player: ${
        JSON.stringify(chosenPlayer)
      }`,
    );
  }

  return [chosenPlayerId, chosenPlayer];
}

import type { RoomData } from "../../types/types.ts";
import { validateRoundStarted } from "../../validators/mod.ts";
import { gameOver } from "./game-over.ts";
import { getNextPlayerTurnId } from "./get-next-player-turn-id.ts";
import { drawCardFromDeck } from "./draw-from-deck.ts";
import { updatePlayer } from "./update-player.ts";

/**
 * @param roomData The current state of the Room
 * @returns The updated room with the turn updated, card drawn for the new player's turn, and game reset. Will call game over if conditions are met.
 */
export const prepRoomDataForNextTurn = (roomData: RoomData): RoomData => {
  const roundData = validateRoundStarted(roomData);

  const nextPlayerTurnId = getNextPlayerTurnId(roomData.players, roundData.playerTurnId);

  const playersStillInRound = Array.from(roomData.players.values()).filter((player) => !player.outOfRound);

  if (nextPlayerTurnId === roundData.playerTurnId || playersStillInRound.length === 1) {
    return gameOver(roomData);
  }
  const nextPlayer = roomData.players.get(nextPlayerTurnId);
  if (!nextPlayer) {
    throw new Error(`Where'd this player go? - ${nextPlayerTurnId}`);
  }

  const { newDeck, cardDrawn } = drawCardFromDeck(roomData.deck);
  if (cardDrawn === null) {
    return gameOver(roomData);
  }

  const updatedPlayers = updatePlayer(roomData.players, nextPlayerTurnId, { cards: [...nextPlayer.cards, cardDrawn] });

  return {
    ...roomData,
    deck: newDeck,
    players: updatedPlayers,
    round: {
      cardPlayed: null,
      details: null,
      playerTurnId: nextPlayerTurnId,
    },
  };
};

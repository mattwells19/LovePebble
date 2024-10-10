import type { Card, Player, PlayerId, RoomData } from "../types/types.ts";
import { validatePlayerExists } from "./validators.ts";

/**
 * @param players The current Map of players in the Room
 * @param currentPlayerTurnId The current player ID for the Room
 * @returns The ID of the next valid player who can take a turn. Will return the `currentPlayerTurnId` if they're the only va;id player in the round.
 */
export const getNextPlayerTurnId = (players: RoomData["players"], currentPlayerTurnId: PlayerId): PlayerId => {
  const playerIds = Array.from(players.keys());
  const currentPlayerTurnIdIndex = playerIds.indexOf(currentPlayerTurnId);

  let newPlayerIdIndex = currentPlayerTurnIdIndex === playerIds.length - 1 ? 0 : currentPlayerTurnIdIndex + 1;

  while (players.get(playerIds.at(newPlayerIdIndex)!)!.outOfRound) {
    newPlayerIdIndex = newPlayerIdIndex === playerIds.length - 1 ? 0 : newPlayerIdIndex + 1;
  }

  return playerIds.at(newPlayerIdIndex)!;
};

export const updatePlayer = (
  players: RoomData["players"],
  playerId: PlayerId,
  playerUpdates: Partial<Player>,
): RoomData["players"] => {
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
};

/**
 * @param deck The current deck for the room
 * @returns The new deck with the card removed and the card that was drawn. Card drawn will be NULL if the deck is empty.
 */
export const drawCardFromDeck = (deck: RoomData["deck"]): { newDeck: RoomData["deck"]; cardDrawn: Card | null } => {
  const deckCopy = deck.slice();
  const cardDrawn = deckCopy.pop()!;
  return { newDeck: deckCopy, cardDrawn };
};

/**
 * @param roomData The current state of the Room
 * @returns The updated room with the turn updated, card drawn for the new player's turn, and game reset. Will call game over if conditions are met.
 */
export const prepRoomDataForNextTurn = (roomData: RoomData): RoomData => {
  const nextPlayerTurnId = getNextPlayerTurnId(roomData.players, roomData.game.playerTurnId);

  // TODO: check if new player is the only one left in the round

  if (nextPlayerTurnId === roomData.game.playerTurnId) {
    // TODO: handle game over
    throw new Error("game over!");
  }
  const nextPlayer = roomData.players.get(nextPlayerTurnId);
  if (!nextPlayer) {
    throw new Error(`Where'd this player go? - ${nextPlayerTurnId}`);
  }

  const { newDeck, cardDrawn } = drawCardFromDeck(roomData.deck);
  if (cardDrawn === null) {
    // TODO: handle game over
    throw new Error("game over!");
  }

  const updatedPlayers = updatePlayer(roomData.players, nextPlayerTurnId, { cards: [...nextPlayer.cards, cardDrawn] });

  return {
    deck: newDeck,
    discard: roomData.discard,
    players: updatedPlayers,
    game: {
      cardPlayed: null,
      details: null,
      lastMoveDescription: roomData.game.lastMoveDescription,
      playerTurnId: nextPlayerTurnId,
      started: true,
    },
  };
};

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

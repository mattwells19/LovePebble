import type { Card, RoomData } from "../../types/types.ts";

/**
 * @param deck The current deck for the room
 * @returns The new deck with the card removed and the card that was drawn. Card drawn will be NULL if the deck is empty.
 */
export const drawCardFromDeck = (deck: RoomData["deck"]): { newDeck: RoomData["deck"]; cardDrawn: Card | null } => {
  const deckCopy = deck.slice();
  const cardDrawn = deckCopy.pop() ?? null;
  return { newDeck: deckCopy, cardDrawn };
};

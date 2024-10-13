import { Card, type Player, type RoomData, type RoundData } from "../types/types.ts";
import { Rooms } from "../repositories/Rooms.ts";
import { validatePlayerExists } from "../validators/mod.ts";
import { submitSelection } from "./submit-selection.ts";

export function playCard(roomCode: string, roomData: RoomData, cardPlayed: Card): RoomData {
  const roundData = roomData.round;
  if (!roundData) {
    throw new Error(`No round data in handlePlayCard`);
  }

  const roomDataWithCardPlayed: RoomData = (() => {
    const player = validatePlayerExists(roomData, roundData.playerTurnId);

    const cardPlayedIndex = player.cards.findIndex((card) => card === cardPlayed);
    if (cardPlayedIndex === -1) {
      throw new Error(`Player did not have ${cardPlayed} in hand. Hand: ${player.cards.join(", ")}`);
    }
    if (
      player.cards.includes(Card.Countess) &&
      (player.cards.includes(Card.Prince) || player.cards.includes(Card.King)) &&
      cardPlayed !== Card.Countess
    ) {
      throw new Error(`If you have the Countess and the King or a Prince, you must play the Countess.`);
    }

    const updatedPlayer: Player = {
      ...player,
      cards: player.cards.toSpliced(cardPlayedIndex, 1),
      handmaidProtected: false,
    };
    const updatedPlayers = new Map(roomData.players);
    updatedPlayers.set(roundData.playerTurnId, updatedPlayer);

    const newDiscard = [...roomData.discard, cardPlayed];

    return {
      ...roomData,
      discard: newDiscard,
      players: updatedPlayers,
    };
  })();

  const newRoundData: RoundData = (() => {
    const genericRoomUpdates: RoundData = roomDataWithCardPlayed.round!;

    switch (cardPlayed) {
      case Card.Guard:
        return {
          ...genericRoomUpdates,
          cardPlayed,
          details: {
            card: null,
            chosenPlayerId: null,
            submitted: false,
          },
        };
      case Card.Baron:
        return {
          ...genericRoomUpdates,
          cardPlayed,
          details: {
            chosenPlayerId: null,
            winningPlayerId: null,
            submitted: false,
          },
        };
      case Card.Chancellor: {
        const deckOptions = roomDataWithCardPlayed.deck.slice(0, 2);
        return {
          ...genericRoomUpdates,
          cardPlayed,
          details: deckOptions
            ? {
              deckOptions: deckOptions,
              card: null,
              submitted: false,
            }
            : null,
        };
      }
      // SimplePlayerSelect
      case Card.Priest:
      case Card.Prince:
      case Card.King:
        return {
          ...genericRoomUpdates,
          cardPlayed,
          details: {
            chosenPlayerId: null,
            submitted: false,
          },
        };
      // No details needed
      case Card.Spy:
      case Card.Handmaid:
      case Card.Countess:
      case Card.Princess:
        return {
          ...genericRoomUpdates,
          cardPlayed,
          details: null,
        };
    }
  })();

  const updatedRoomData: RoomData = {
    ...roomDataWithCardPlayed,
    round: newRoundData,
  };

  if (updatedRoomData.round!.details === null) {
    // if there are no details to add, go ahead and play the card
    return submitSelection(roomCode, updatedRoomData);
  }

  Rooms.set(roomCode, updatedRoomData);

  return updatedRoomData;
}

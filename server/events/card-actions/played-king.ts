import { prepRoomDataForNextTurn, updatePlayer } from "../utils/mod.ts";
import { Card, type PlayedKing, type RoomData, type RoundStarted } from "../../types/types.ts";
import { validatePlayerExists, validatePlayerSelection, validateRoundStarted } from "../../validators/mod.ts";

export function playedKing(roomData: RoomData): RoomData {
  const roundData = validateRoundStarted<RoundStarted & PlayedKing>(roomData);

  const playingPlayer = validatePlayerExists(roomData, roundData.playerTurnId);
  const [chosenPlayerId, chosenPlayer] = validatePlayerSelection(roomData, Card.King);

  let updatedRoomData: RoomData | null = null;

  if (chosenPlayerId && chosenPlayer) {
    const playerCards = playingPlayer.cards;
    const chosenPlayerCards = chosenPlayer.cards;

    let updatedPlayers = updatePlayer(roomData.players, roundData.playerTurnId, { cards: chosenPlayerCards });
    updatedPlayers = updatePlayer(updatedPlayers, chosenPlayerId, { cards: playerCards });

    updatedRoomData = {
      ...roomData,
      players: updatedPlayers,
      round: roundData,
      roundLog: [
        ...roomData.roundLog,
        `${playingPlayer.name} played the King and decided to swap cards with ${chosenPlayer.name}.`,
      ],
    };
  } else {
    updatedRoomData = {
      ...roomData,
      round: roundData,
      roundLog: [
        ...roomData.roundLog,
        `${playingPlayer.name} played the King, but there were no players to select so the card has no effect.`,
      ],
    };
  }

  return prepRoomDataForNextTurn(updatedRoomData);
}

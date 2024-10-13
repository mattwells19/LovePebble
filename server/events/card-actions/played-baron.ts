import { prepRoomDataForNextTurn } from "../utils/mod.ts";
import { Card, type PlayedBaron, type PlayerId, type RoomData, type RoundStarted } from "../../types/types.ts";
import { validatePlayerExists, validatePlayerSelection, validateRoundStarted } from "../../validators/mod.ts";

export function playedBaron(roomData: RoomData): RoomData {
  const roundData = validateRoundStarted<RoundStarted & PlayedBaron>(roomData);

  const playingPlayer = validatePlayerExists(roomData, roundData.playerTurnId);
  const [playerIdBeingChallenged, playerBeingChallenged] = validatePlayerSelection(roomData, Card.Baron);

  let updatedRoomData: RoomData | null = null;

  if (playerIdBeingChallenged && playerBeingChallenged) {
    const winningPlayerId: PlayerId | null = (() => {
      const currentPlayersCard = playingPlayer.cards[0];
      const challengedPlayersCard = playerBeingChallenged.cards[0];

      if (currentPlayersCard > challengedPlayersCard) {
        return roundData.playerTurnId;
      } else if (challengedPlayersCard > currentPlayersCard) {
        return playerIdBeingChallenged;
      } else {
        return null;
      }
    })();

    const resultText = (() => {
      if (winningPlayerId === roundData.playerTurnId) {
        return `${playingPlayer.name} wins the challenge! ${playerBeingChallenged.name} is out of the round.`;
      } else if (winningPlayerId === playerIdBeingChallenged) {
        return `${playingPlayer.name} lost the challenge and is out of the round.`;
      } else {
        return "The result is a tie! Both players remain in the round.";
      }
    })();

    updatedRoomData = {
      ...roomData,
      round: {
        ...roundData,
        details: {
          ...roundData.details,
          winningPlayerId,
          submitted: true,
        },
      },
      roundLog: [
        ...roomData.roundLog,
        `${playingPlayer.name} played the Baron and challenged ${playerBeingChallenged.name}. ${resultText}`,
      ],
    };
  } else {
    updatedRoomData = {
      ...roomData,
      round: roundData,
      roundLog: [
        ...roomData.roundLog,
        `${playingPlayer.name} played the Baron, but there were no players to challenge so the card has no effect.`,
      ],
    };

    updatedRoomData = prepRoomDataForNextTurn(updatedRoomData);
  }

  // don't prepRoomDataForNextTurn if selections were made since Baron requries an Acknowledge action
  return updatedRoomData;
}

import { LOG_MESSAGES, prepRoomDataForNextTurn } from "../utils/mod.ts";
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

    const challengeResult = (() => {
      if (winningPlayerId === roundData.playerTurnId) {
        return "win";
      } else if (winningPlayerId === playerIdBeingChallenged) {
        return "loss";
      } else {
        return "tie";
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
        LOG_MESSAGES.baron.challenging(playingPlayer.name, playerBeingChallenged.name, challengeResult),
      ],
    };
  } else {
    updatedRoomData = {
      ...roomData,
      round: roundData,
      roundLog: [
        ...roomData.roundLog,
        LOG_MESSAGES.baron.noEffect(playingPlayer.name),
      ],
    };

    updatedRoomData = prepRoomDataForNextTurn(updatedRoomData);
  }

  // don't prepRoomDataForNextTurn if selections were made since Baron requries an Acknowledge action
  return updatedRoomData;
}

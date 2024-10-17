import type { Player, PlayerId, RoomData } from "../../types/types.ts";
import { LOG_MESSAGES } from "./mod.ts";
import { updatePlayer } from "./update-player.ts";

export function gameOver(roomData: RoomData): RoomData {
  let winningPlayers: Array<[PlayerId, Player]> = [];

  const playersStillInRound: Array<[PlayerId, Player]> = Array.from(roomData.players).filter(([, player]) =>
    !player.outOfRound
  );

  if (playersStillInRound.length === 1) {
    winningPlayers = [...playersStillInRound];
  } else {
    winningPlayers = playersStillInRound.reduce((playersWinByValue, [playerId, player]) => {
      if (playersWinByValue.length === 0) {
        return [[playerId, player]];
      }
      if (player.cards[0] > playersWinByValue[0][1].cards[0]) {
        return [[playerId, player]];
      }
      if (player.cards[0] === playersWinByValue[0][1].cards[0]) {
        return [...playersWinByValue, [playerId, player]];
      }

      return playersWinByValue;
    }, [] as Array<[PlayerId, Player]>);
  }

  let updatedPlayers: RoomData["players"] = roomData.players;

  for (const [winningPlayerId, winningPlayer] of winningPlayers) {
    updatedPlayers = updatePlayer(updatedPlayers, winningPlayerId, { gameScore: winningPlayer.gameScore + 1 });
  }

  const playersInRoundWithSpy = playersStillInRound.filter(([, player]) => player.playedSpy);

  const [spyWinningPlayerId] = playersInRoundWithSpy.length === 1 ? playersInRoundWithSpy[0] : [null];
  const spyWinningPlayer = spyWinningPlayerId ? updatedPlayers.get(spyWinningPlayerId)! : null;

  if (spyWinningPlayerId && spyWinningPlayer) {
    updatedPlayers = updatePlayer(updatedPlayers, spyWinningPlayerId, { gameScore: spyWinningPlayer.gameScore + 1 });
  }

  return {
    gameStarted: true,
    deck: [],
    discard: [],
    players: updatedPlayers,
    spectators: roomData.spectators,
    round: null,
    roundLog: [
      ...roomData.roundLog,
      LOG_MESSAGES.gameOver(winningPlayers.map(([, player]) => player.name), spyWinningPlayer?.name),
    ],
  };
}

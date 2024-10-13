import type { Player, PlayerId, RoomData } from "../../types/types.ts";
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

  const logMessages = [];

  for (const [winningPlayerId, winningPlayer] of winningPlayers) {
    updatedPlayers = updatePlayer(updatedPlayers, winningPlayerId, { gameScore: winningPlayer.gameScore + 1 });
  }
  logMessages.push(
    `${winningPlayers.map(([, player]) => player.name).join(", ")} all get pebbles for winning the round!`,
  );

  const playersInRoundWithSpy = playersStillInRound.filter(([, player]) => player.playedSpy);
  if (playersInRoundWithSpy.length === 1) {
    const [playerId] = playersInRoundWithSpy[0];
    const player = updatedPlayers.get(playerId)!;
    updatedPlayers = updatePlayer(updatedPlayers, playerId, { gameScore: player.gameScore + 1 });

    logMessages.push(`${player.name} gets a pebble for being the last Spy standing!`);
  }

  return {
    gameStarted: true,
    deck: [],
    discard: [],
    players: updatedPlayers,
    round: null,
    roundLog: [...roomData.roundLog, logMessages.join("\n\n")],
  };
}

import type { Player, PlayerId, RoomData } from "../../types/types.ts";
import { LOG_MESSAGES } from "./mod.ts";
import { updatePlayer } from "./update-player.ts";

export function getRoundWinningPlayers(roomData: RoomData): Map<PlayerId, Player> {
  const playersStillInRound: Array<[PlayerId, Player]> = Array.from(roomData.players).filter(([, player]) =>
    !player.outOfRound
  );

  // this function is used in start-round, so this can be true when starting a new game
  if (playersStillInRound.length === 0) {
    return new Map();
  }

  if (playersStillInRound.length === 1) {
    return new Map(playersStillInRound);
  }

  const winningPlayers: Array<[PlayerId, Player]> = playersStillInRound.reduce(
    (playersWinByValue, [playerId, player]) => {
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
    },
    [] as Array<[PlayerId, Player]>,
  );

  return new Map(winningPlayers);
}

export function gameOver(roomData: RoomData): RoomData {
  const winningPlayers = getRoundWinningPlayers(roomData);

  const playersStillInRound: Array<[PlayerId, Player]> = Array.from(roomData.players).filter(([, player]) =>
    !player.outOfRound
  );

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
      LOG_MESSAGES.gameOver(Array.from(winningPlayers).map(([, player]) => player.name), spyWinningPlayer?.name),
    ],
  };
}

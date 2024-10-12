import type { Card, Player, PlayerId, RoomData } from "../types/types.ts";
import { validatePlayerExists, validateRoundStarted } from "./validators.ts";

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

const processGameOver = (roomData: RoomData): RoomData => {
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
};

/**
 * @param deck The current deck for the room
 * @returns The new deck with the card removed and the card that was drawn. Card drawn will be NULL if the deck is empty.
 */
export const drawCardFromDeck = (deck: RoomData["deck"]): { newDeck: RoomData["deck"]; cardDrawn: Card | null } => {
  const deckCopy = deck.slice();
  const cardDrawn = deckCopy.pop() ?? null;
  return { newDeck: deckCopy, cardDrawn };
};

/**
 * @param roomData The current state of the Room
 * @returns The updated room with the turn updated, card drawn for the new player's turn, and game reset. Will call game over if conditions are met.
 */
export const prepRoomDataForNextTurn = (roomData: RoomData): RoomData => {
  const roundData = validateRoundStarted(roomData);

  const nextPlayerTurnId = getNextPlayerTurnId(roomData.players, roundData.playerTurnId);

  const playersStillInRound = Array.from(roomData.players.values()).filter((player) => !player.outOfRound);

  if (nextPlayerTurnId === roundData.playerTurnId || playersStillInRound.length === 1) {
    return processGameOver(roomData);
  }
  const nextPlayer = roomData.players.get(nextPlayerTurnId);
  if (!nextPlayer) {
    throw new Error(`Where'd this player go? - ${nextPlayerTurnId}`);
  }

  const { newDeck, cardDrawn } = drawCardFromDeck(roomData.deck);
  if (cardDrawn === null) {
    return processGameOver(roomData);
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

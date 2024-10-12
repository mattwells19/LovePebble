import { Rooms } from "../repositories/Rooms.ts";
import { type OutgoingGameStateUpdate, SocketOutgoing } from "../types/socket.types.ts";
import { Card, type Player, type PlayerId, type RoomData, type RoundData, StandardDeck } from "../types/types.ts";
import { roomDataToGameStateUpdate, shuffle } from "../utils.ts";
import type { SocketData } from "./socket.ts";
import * as cardActionHandlers from "./card-action-handlers.ts";
import { knockPlayerOutOfRound, prepRoomDataForNextTurn, updatePlayer } from "./gameFlow.ts";
import { validatePlayerExists } from "./validators.ts";

interface JoinResult {
  type: SocketOutgoing.PlayerUpdate;
  data: [PlayerId, Player][];
}

export function join(socketData: SocketData, room: RoomData, playerName: string): JoinResult {
  // add the new player to the room
  const newPlayer: Player = {
    cards: [],
    gameScore: 0,
    handmaidProtected: false,
    playedSpy: false,
    name: playerName,
    outOfRound: false,
  };
  room.players.set(socketData.playerId, newPlayer);

  return {
    data: Array.from(room.players),
    type: SocketOutgoing.PlayerUpdate,
  };
}

export function startGame(roomCode: string, room: RoomData): OutgoingGameStateUpdate {
  const updatedRoomData: RoomData = {
    deck: [],
    discard: [],
    round: null,
    gameStarted: true,
    players: room.players,
    roundLog: [],
  };

  return startRound(roomCode, updatedRoomData);
}

export function startRound(roomCode: string, room: RoomData): OutgoingGameStateUpdate {
  const updatedRound: RoundData = {
    cardPlayed: null,
    details: null,
    playerTurnId: room.players.keys().next().value!,
  };

  let updatedPlayers: RoomData["players"] = new Map(room.players);
  for (const [playerId] of room.players) {
    updatedPlayers = updatePlayer(updatedPlayers, playerId, {
      cards: [],
      handmaidProtected: false,
      outOfRound: false,
      playedSpy: false,
    });
  }

  const deck = shuffle(StandardDeck.slice());
  const discard: Array<Card> = [];

  switch (room.players.size) {
    // since this is the start of the game, we are guaranteed to have enough cards
    // for even the max number of players so pop is always safe here
    case 2:
      discard.push(deck.pop()!);
      discard.push(deck.pop()!);
    /* falls through */
    default:
      discard.push(deck.pop()!);
  }

  updatedPlayers.forEach((player: Player, id: PlayerId) => {
    const playerHand: Array<Card> = [];

    // since this is the start of the game, we are guaranteed to have enough cards
    // for even the max number of players so pop is always safe here
    playerHand.push(deck.pop()!);

    // add extra card to the player whose turn it is
    if (updatedRound.playerTurnId === id) {
      playerHand.push(deck.pop()!);
    }

    updatedPlayers.set(id, {
      ...player,
      cards: playerHand,
    });
  });

  const updatedRoomData: RoomData = {
    deck,
    discard,
    round: updatedRound,
    players: updatedPlayers,
    roundLog: ["Game started!"],
    gameStarted: true,
  };
  Rooms.set(roomCode, updatedRoomData);

  return roomDataToGameStateUpdate(updatedRoomData);
}

export function handlePlayCard(roomCode: string, roomData: RoomData, cardPlayed: Card): OutgoingGameStateUpdate {
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
    return handleSubmitSelection(roomCode, updatedRoomData);
  }

  Rooms.set(roomCode, updatedRoomData);

  return roomDataToGameStateUpdate(updatedRoomData);
}

export function handleSelectPlayer(roomCode: string, room: RoomData, playerSelected: string): OutgoingGameStateUpdate {
  const roomCopy = structuredClone(room);

  if (!roomCopy.round?.details || "chosenPlayerId" in roomCopy.round.details === false) {
    throw new Error(`Details didn't ask for chosenPlayerId. Game state: ${JSON.stringify(room.round)}`);
  }

  roomCopy.round.details.chosenPlayerId = playerSelected;
  Rooms.set(roomCode, roomCopy);

  return roomDataToGameStateUpdate(roomCopy);
}

export function handleSelectCard(roomCode: string, room: RoomData, cardSelected: Card): OutgoingGameStateUpdate {
  if (!room.round?.details || "card" in room.round?.details === false) {
    throw new Error(`Did not ask for card selection.`);
  }

  let newRoundData: RoundData | null = null;

  if (room.round?.cardPlayed === Card.Guard) {
    newRoundData = {
      ...room.round,
      details: {
        ...room.round.details,
        card: cardSelected,
      },
    };
  } else if (room.round.cardPlayed === Card.Chancellor) {
    newRoundData = {
      ...room.round,
      details: {
        ...room.round.details,
        card: cardSelected,
      },
    };
  } else {
    throw new Error(`Card selection wasn't for a Guard or Chancellor.`);
  }

  const updatedRoomData: RoomData = {
    ...room,
    round: newRoundData,
  };

  Rooms.set(roomCode, updatedRoomData);

  return roomDataToGameStateUpdate(updatedRoomData);
}

export function handleSubmitSelection(roomCode: string, room: RoomData): OutgoingGameStateUpdate {
  const newRoomData = (() => {
    switch (room.round?.cardPlayed) {
      case Card.Spy:
        return cardActionHandlers.handlePlayedSpy(room);
      case Card.Guard:
        return cardActionHandlers.handlePlayedGuard(room);
      case Card.Priest:
        return cardActionHandlers.handlePlayedPriest(room);
      case Card.Baron:
        return cardActionHandlers.handlePlayedBaron(room);
      case Card.Handmaid:
        return cardActionHandlers.handlePlayedHandmaid(room);
      case Card.Prince:
        return cardActionHandlers.handlePlayedPrince(room);
      case Card.Chancellor:
        return cardActionHandlers.handlePlayedChancellor(room);
      case Card.King:
        return cardActionHandlers.handlePlayedKing(room);
      case Card.Countess:
        return cardActionHandlers.handlePlayedCountess(room);
      case Card.Princess:
        return cardActionHandlers.handlePlayedPrincess(room);
      default:
        throw new Error(`Action not yet implemented for ${room.round?.cardPlayed}.`);
    }
  })();

  Rooms.set(roomCode, newRoomData);
  return roomDataToGameStateUpdate(newRoomData);
}

export function handleAcknowledgeAction(roomCode: string, room: RoomData): OutgoingGameStateUpdate {
  let updatedRoomData = room;

  if (room.round?.cardPlayed === Card.Baron && room.round.details.winningPlayerId !== null) {
    const losingplayerId = room.round.details.winningPlayerId === room.round.playerTurnId
      ? room.round.details.chosenPlayerId
      : room.round.playerTurnId;
    if (!losingplayerId) {
      throw new Error(`No losing player to update ?`);
    }

    updatedRoomData = knockPlayerOutOfRound(room, losingplayerId);
  }

  const roomDataForNextTurn = prepRoomDataForNextTurn(updatedRoomData);
  Rooms.set(roomCode, roomDataForNextTurn);

  return roomDataToGameStateUpdate(roomDataForNextTurn);
}

export function handleResetGame(roomCode: string, room: RoomData): OutgoingGameStateUpdate {
  let updatedPlayers: RoomData["players"] = room.players;
  for (const [playerId] of room.players) {
    updatedPlayers = updatePlayer(updatedPlayers, playerId, {
      cards: [],
      gameScore: 0,
      handmaidProtected: false,
      outOfRound: false,
      playedSpy: false,
    });
  }

  const updatedRoomData: RoomData = {
    deck: [],
    discard: [],
    round: null,
    roundLog: [],
    gameStarted: false,
    players: updatedPlayers,
  };

  Rooms.set(roomCode, updatedRoomData);

  return roomDataToGameStateUpdate(updatedRoomData);
}

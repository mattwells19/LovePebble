import { Rooms } from "../repositories/Rooms.ts";
import { OutgoingGameStateUpdate, SocketOutgoing } from "../types/socket.types.ts";
import { Card, GameData, Player, PlayerId, RoomData, StandardDeck, RoomDataGameNotStarted } from "../types/types.ts";
import { shuffle } from "../utils.ts";
import { SocketData } from "./socket.ts";

interface JoinResult {
  type: SocketOutgoing.PlayerUpdate;
  data: [PlayerId, Player][];
}

export function join(socketData: SocketData, room: RoomData | RoomDataGameNotStarted, playerName: string): JoinResult {
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

export function startGame(roomCode: string, room: RoomDataGameNotStarted): OutgoingGameStateUpdate {
  const updatedGameState: GameData = {
    cardPlayed: null,
    details: null,
    playerTurnId: room.players.keys().next().value!,
    started: true,
    lastMoveDescription: null,
  };

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

  const updatedPlayers = new Map(room.players);
  updatedPlayers.forEach((player: Player, id: PlayerId) => {
    const playerHand: Array<Card> = [];

    // since this is the start of the game, we are guaranteed to have enough cards
    // for even the max number of players so pop is always safe here
    playerHand.push(deck.pop()!);

    // add extra card to the player whose turn it is
    if (updatedGameState.playerTurnId === id) {
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
    game: updatedGameState,
    players: updatedPlayers,
  };
  Rooms.set(roomCode, updatedRoomData);

  const gameData: OutgoingGameStateUpdate = {
    deckCount: deck.length,
    discard,
    game: updatedGameState,
    players: Array.from(updatedPlayers),
  };

  return gameData;
}

export function handlePlayCard(roomCode: string, roomData: RoomData, cardPlayed: Card): OutgoingGameStateUpdate {
  const roomDataWithCardPlayed = (() => {
    const player = roomData.players.get(roomData.game.playerTurnId);
    if (!player) throw new Error("Where'd this player go??");

    const updatedPlayer: Player = {
      ...player,
      cards: player.cards.filter((c) => c !== cardPlayed),
    };
    const updatedPlayers = new Map(roomData.players);
    updatedPlayers.set(roomData.game.playerTurnId, updatedPlayer);

    const newDiscard = [...roomData.discard, cardPlayed];

    return {
      ...roomData,
      discard: newDiscard,
      players: updatedPlayers,
    };
  })();

  const genericRoomUpdates: GameData = {
    ...roomDataWithCardPlayed.game,
    lastMoveDescription: null,
  };

  const newGameData = (() => {
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
      case Card.Chancellor:
        return {
          ...genericRoomUpdates,
          cardPlayed,
          details: {
            deckOptions: roomData.deck.slice(0, 2),
            chosenCard: null,
          },
        };
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
        // TODO: this should call CardActionHandler
        return {
          ...genericRoomUpdates,
          cardPlayed,
          details: null,
        };
    }
  })();

  const updatedRoomData: RoomData = {
    ...roomDataWithCardPlayed,
    game: newGameData,
  };
  Rooms.set(roomCode, updatedRoomData);

  return {
    deckCount: roomDataWithCardPlayed.deck.length,
    discard: roomDataWithCardPlayed.discard,
    players: Array.from(roomDataWithCardPlayed.players),
    game: newGameData,
  };
}

export function handleSelectPlayer(
  roomCode: string,
  room: RoomData,
  playerSelected: string,
): OutgoingGameStateUpdate | null {
  if (!room.game.details || !("chosenPlayerId" in room.game.details)) {
    return null;
  }

  const newGameData: GameData = {
    ...room.game,
    details: {
      ...room.game.details,
      chosenPlayerId: playerSelected,
    },
  };

  const updatedRoomData: RoomData = {
    ...room,
    game: newGameData,
  };

  Rooms.set(roomCode, updatedRoomData);

  return {
    deckCount: updatedRoomData.deck.length,
    discard: updatedRoomData.discard,
    game: updatedRoomData.game,
    players: Array.from(updatedRoomData.players),
  };
}

export function handleSelectCard(roomCode: string, room: RoomData, cardSelected: Card): OutgoingGameStateUpdate | null {
  if (!room.game.details || room.game.cardPlayed !== Card.Guard) {
    return null;
  }

  const newGameData: GameData = {
    ...room.game,
    details: {
      ...room.game.details,
      card: cardSelected,
    },
  };

  const updatedRoomData: RoomData = {
    ...room,
    game: newGameData,
  };

  Rooms.set(roomCode, updatedRoomData);

  return {
    deckCount: updatedRoomData.deck.length,
    discard: updatedRoomData.discard,
    game: updatedRoomData.game,
    players: Array.from(updatedRoomData.players),
  };
}

import { useReducer } from "react";
import { type Card, type Player, type PlayerId, type RoundData, SocketOutgoing } from "@lovepebble/server";
import type { SocketMessage } from "./GameStateContext.types.ts";

export interface RoomGameState {
  gameStarted: boolean;
  deckCount: number;
  discard: Array<Card>;
  players: Map<PlayerId, Player>;
  spectators: Map<PlayerId, string>;
  round: RoundData | null;
  roundLog: Array<string>;
  currentPlayerId: PlayerId;
}

function gameStateContextReducer(currentState: RoomGameState, action: SocketMessage): RoomGameState {
  switch (action.type) {
    case SocketOutgoing.Connected:
      return {
        ...currentState,
        currentPlayerId: action.data.userId,
      };
    case SocketOutgoing.GameUpdate:
      return {
        ...currentState,
        gameStarted: action.data.gameStarted,
        deckCount: action.data.deckCount,
        discard: action.data.discard,
        round: action.data.round,
        players: new Map(action.data.players),
        spectators: new Map(action.data.spectators),
        roundLog: action.data.roundLog,
      };
  }
}

export function useGameStateReducer() {
  return useReducer<RoomGameState, [action: SocketMessage]>(gameStateContextReducer, {
    gameStarted: false,
    currentPlayerId: "",
    deckCount: 0,
    discard: [],
    round: null,
    players: new Map(),
    spectators: new Map(),
    roundLog: [],
  });
}

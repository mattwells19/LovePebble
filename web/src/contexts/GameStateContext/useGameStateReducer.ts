import { useReducer } from "react";
import { type Card, type GameData, type Player, type PlayerId, SocketOutgoing } from "@lovepebble/server";
import type { SocketMessage } from "./GameStateContext.types.ts";

export interface RoomGameState {
  currentPlayerId: PlayerId;
  players: Map<PlayerId, Player>;
  deckCount: number;
  discard: Array<Card>;
  gameState: GameData | null;
}

function gameStateContextReducer(currentState: RoomGameState, action: SocketMessage): RoomGameState {
  switch (action.type) {
    case SocketOutgoing.Connected:
      return {
        ...currentState,
        currentPlayerId: action.data,
      };
    case SocketOutgoing.PlayerUpdate:
      return {
        ...currentState,
        players: new Map(action.data),
      };
    case SocketOutgoing.GameUpdate:
      return {
        ...currentState,
        deckCount: action.data.deckCount,
        discard: action.data.discard,
        gameState: action.data.game,
        players: new Map(action.data.players),
      };
  }
}

export function useGameStateReducer() {
  return useReducer<RoomGameState, [action: SocketMessage]>(gameStateContextReducer, {
    currentPlayerId: "",
    deckCount: 0,
    discard: [],
    gameState: null,
    players: new Map(),
  });
}

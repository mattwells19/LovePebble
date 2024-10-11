import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { decodeAsync, encode } from "@msgpack/msgpack";
import { type Card, SocketIncoming, type SocketMessage as OutboundSocketMessage } from "@lovepebble/server";
import type { SocketMessage } from "./GameStateContext.types.ts";
import { type RoomGameState, useGameStateReducer } from "./useGameStateReducer.ts";

interface GameStateContextValue extends Omit<RoomGameState, "discard"> {
  discard: Array<Card | "Hidden">;
  sendGameUpdate: (msg: OutboundSocketMessage) => void;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export const GameStateProvider = ({ children }: PropsWithChildren) => {
  const { roomCode = "" } = useParams();
  const [roomGameState, dispatch] = useGameStateReducer();
  const webscoketRef = useRef<WebSocket | null>(null);

  const sendGameUpdate = (msg: OutboundSocketMessage) => {
    webscoketRef.current?.send(encode(msg));
  };

  useEffect(() => {
    if (webscoketRef.current) {
      return;
    }

    const wsProtocol = location.protocol === "https:" ? "wss" : "ws";
    webscoketRef.current = new WebSocket(`${wsProtocol}://${location.host}/socket`);

    webscoketRef.current.addEventListener("open", () => {
      webscoketRef.current?.send(
        encode({
          playerName: localStorage.getItem("playerName"),
          roomCode,
          type: SocketIncoming.Join,
        }),
      );
    });

    webscoketRef.current.addEventListener("message", (msg: MessageEvent<Blob>) => {
      decodeAsync(msg.data.stream()).then((socketMsg) => {
        dispatch(socketMsg as SocketMessage);
      });
    });

    webscoketRef.current.addEventListener("error", (e) => {
      console.error("WS Error: ", e);
    });

    return () => {
      webscoketRef.current?.close();
      webscoketRef.current = null;
    };
  }, []);

  /**
   * We don't want to show which cards are auto-removed from the deck when a game starts.
   * 2 players removes 3 cards; > 2 players removes 1 so replace the auto removed cards
   * with "Hidden".
   */
  const discardWithHidden: Array<Card | "Hidden"> = useMemo(() => {
    const roomSize = roomGameState.players.size;

    if (roomGameState.gameState?.started && roomSize < 2) {
      throw new Error("Game started with less than 2 players which should be impossible.");
    }

    return (
      roomGameState.discard
        .map((card, index) => {
          if (index === 0) {
            return "Hidden";
          } else {
            return card;
          }
        })
        /**
         * Discard pile is reversed when sent from the backend so the most recent discard
         * is on the bottom (last index). Reverse the order so that the top card is the most
         * recently played. Makes it easier when displaying the discard pile
         */
        .reverse()
    );
  }, [Boolean(roomGameState.gameState?.started), roomGameState.discard]);

  return (
    <GameStateContext.Provider value={{ ...roomGameState, discard: discardWithHidden, sendGameUpdate }}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = (): GameStateContextValue => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("Cannot use Gamestate context outside of GameStateProvider.");
  } else {
    return context;
  }
};

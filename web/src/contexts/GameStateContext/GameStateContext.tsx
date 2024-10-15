import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { decodeAsync, encode } from "@msgpack/msgpack";
import { useToast } from "@chakra-ui/react";
import { SocketIncoming, type SocketMessage as OutboundSocketMessage, SocketOutgoing } from "@lovepebble/server";
import type { SocketMessage } from "./GameStateContext.types.ts";
import { type RoomGameState, useGameStateReducer } from "./useGameStateReducer.ts";
import type { RoomLoaderResult } from "../../pages/Room/Room.tsx";

export interface GameStateContextValue extends RoomGameState {
  sendGameUpdate: (msg: OutboundSocketMessage) => void;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export const GameStateProvider = ({ children }: PropsWithChildren) => {
  const { roomCode, playerName, userId } = useLoaderData() as RoomLoaderResult;
  const navigate = useNavigate();
  const toast = useToast();
  const [roomGameState, dispatch] = useGameStateReducer();
  const webscoketRef = useRef<WebSocket | null>(null);

  const sendGameUpdate = useCallback((msg: OutboundSocketMessage) => {
    webscoketRef.current?.send(encode(msg));
  }, []);

  useEffect(() => {
    if (webscoketRef.current) {
      return;
    }

    const wsProtocol = location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = new URL(`${wsProtocol}://${location.host}/ws/${roomCode}`);
    if (userId) {
      wsUrl.searchParams.set("userId", userId);
    }
    webscoketRef.current = new WebSocket(wsUrl);

    webscoketRef.current.addEventListener("message", (msg: MessageEvent<Blob>) => {
      decodeAsync(msg.data.stream()).then((socketMsg) => {
        const msg = socketMsg as SocketMessage;

        if (msg.type === SocketOutgoing.Connected) {
          if (userId !== msg.data.userId) {
            sessionStorage.setItem("userId", msg.data.userId);
          }
          if (msg.data.roomExists === false) {
            toast({
              title: "A room with that room code does not exist.",
              variant: "solid",
              status: "error",
            });
            navigate("/");
          }

          sendGameUpdate({
            type: SocketIncoming.Join,
            playerName,
          });
        }

        dispatch(msg);
      });
    });

    webscoketRef.current.addEventListener("error", (e) => {
      console.error("WS Error: ", e);
    });

    webscoketRef.current.addEventListener("close", (e) => {
      // 1000 means it was closed normally
      if (e.code !== 1000) {
        console.info("WS Closed: ", e.code, e.reason);
        // TODO: reconnect
      }
    });

    return () => {
      webscoketRef.current?.close();
      webscoketRef.current = null;
    };
  }, []);

  const gameStateContextValue: GameStateContextValue = useMemo(
    () => ({ ...roomGameState, sendGameUpdate }),
    [roomGameState, sendGameUpdate],
  );

  return (
    <GameStateContext.Provider value={gameStateContextValue}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = (): GameStateContextValue => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("Cannot use game state context outside of GameStateProvider.");
  } else {
    return context;
  }
};

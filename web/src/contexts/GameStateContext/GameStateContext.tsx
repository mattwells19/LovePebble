import { createContext, FC, useContext, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SocketIncoming, SocketMessage as OutboundSocketMessage } from "../../../../server/types/socket.types";
import { SocketMessage } from "./GameStateContext.types";
import { RoomGameState, useGameStateReducer } from "./useGameStateReducer";

interface GameStateContextValue extends RoomGameState {
  sendGameUpdate: (msg: OutboundSocketMessage) => void;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export const GameStateProvider: FC = ({ children }) => {
  const navigate = useNavigate();
  const { roomCode = "" } = useParams();
  const [roomGameState, dispatch] = useGameStateReducer();
  const webscoketRef = useRef<WebSocket | null>(null);

  const sendGameUpdate = (msg: OutboundSocketMessage) => {
    webscoketRef.current?.send(JSON.stringify(msg));
  };

  useEffect(() => {
    const wsProtocol = location.protocol === "https:" ? "wss" : "ws";
    webscoketRef.current = new WebSocket(`${wsProtocol}://${location.host}/socket`);

    webscoketRef.current.addEventListener("open", () => {
      webscoketRef.current?.send(
        JSON.stringify({
          oldPlayerId: sessionStorage.getItem("playerId"),
          playerName: localStorage.getItem("playerName"),
          roomCode,
          type: SocketIncoming.Join,
        }),
      );
    });

    webscoketRef.current.addEventListener("message", (msg: MessageEvent<string>) => {
      const socketMsg: SocketMessage = JSON.parse(msg.data);
      dispatch(socketMsg);
    });

    webscoketRef.current.addEventListener("error", (e) => {
      console.error("WS Error: ", e);
      navigate("/");
    });

    return () => {
      webscoketRef.current?.close();
      webscoketRef.current = null;
    };
  }, []);

  return <GameStateContext.Provider value={{ ...roomGameState, sendGameUpdate }}>{children}</GameStateContext.Provider>;
};

export const useGameState = (): GameStateContextValue => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("Cannot use Gamestate context outside of GameStateProvider.");
  } else {
    return context;
  }
};

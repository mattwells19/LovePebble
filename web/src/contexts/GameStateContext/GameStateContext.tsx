import { createContext, FC, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  SocketIncoming,
  SocketOutgoing,
  SocketMessage as OutboundSocketMessage,
} from "../../../../server/types/socket.types";
import { PlayerId, Player, GameData } from "../../../../server/types/types";
import { SocketMessage } from "./GameStateContext.types";

interface GameStateContextValue {
  players: Map<PlayerId, Player>;
  currentPlayerId: PlayerId;
  sendGameUpdate: (msg: OutboundSocketMessage) => void;
  deckCount: number;
  gameState: GameData | null;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export const GameStateProvider: FC = ({ children }) => {
  const navigate = useNavigate();
  const { roomCode = "" } = useParams();
  const [currentPlayerId, setCurrentPlayerId] = useState<PlayerId>("");
  const [players, setPlayers] = useState<Map<PlayerId, Player>>(new Map());
  const [deckCount, setDeckCount] = useState<number>(0);
  const [gameState, setGameState] = useState<GameData | null>(null);
  const webscoketRef = useRef<WebSocket | null>(null);

  const sendGameUpdate = (msg: OutboundSocketMessage) => {
    webscoketRef.current?.send(JSON.stringify(msg));
  };

  useEffect(() => {
    webscoketRef.current = new WebSocket("ws://localhost:3001");

    webscoketRef.current.addEventListener("open", () => {
      webscoketRef.current?.send(
        JSON.stringify({
          playerName: localStorage.getItem("playerName"),
          roomCode,
          type: SocketIncoming.Join,
        }),
      );
    });

    webscoketRef.current.addEventListener("message", (msg: MessageEvent<string>) => {
      const socketMsg: SocketMessage = JSON.parse(msg.data);

      switch (socketMsg.type) {
        case SocketOutgoing.Connected:
          setCurrentPlayerId(socketMsg.data);
          break;
        case SocketOutgoing.PlayerUpdate:
          setPlayers(new Map(socketMsg.data));
          break;
        case SocketOutgoing.GameUpdate:
          setPlayers(new Map(socketMsg.data.players));
          setDeckCount(socketMsg.data.deckCount);
          setGameState(socketMsg.data.game);
          break;
      }
    });

    webscoketRef.current.addEventListener("error", () => {
      navigate("/");
    });

    return () => {
      webscoketRef.current?.close();
      webscoketRef.current = null;
    };
  }, []);

  return (
    <GameStateContext.Provider value={{ currentPlayerId, deckCount, gameState, players, sendGameUpdate }}>
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

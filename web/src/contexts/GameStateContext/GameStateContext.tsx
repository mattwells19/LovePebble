import { createContext, FC, useContext, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SocketIncoming, SocketMessage as OutboundSocketMessage } from "../../../../server/types/socket.types";
import { PlayerId, Player, GameData, Card } from "../../../../server/types/types";
import { SocketMessage } from "./GameStateContext.types";
import { useGameStateReducer } from "./useGameStateReducer";

interface GameStateContextValue {
  players: Map<PlayerId, Player>;
  discard: Array<Card | "Hidden">;
  currentPlayerId: PlayerId;
  sendGameUpdate: (msg: OutboundSocketMessage) => void;
  deckCount: number;
  gameState: GameData | null;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export const GameStateProvider: FC = ({ children }) => {
  const navigate = useNavigate();
  const { roomCode = "" } = useParams();
  const [roomGameState, dispatch] = useGameStateReducer();
  const roomSizeRef = useRef<number>(1);
  const webscoketRef = useRef<WebSocket | null>(null);

  const sendGameUpdate = (msg: OutboundSocketMessage) => {
    if (msg.type === SocketIncoming.StartGame) {
      roomSizeRef.current = roomGameState.players.size;
    }

    webscoketRef.current?.send(JSON.stringify(msg));
  };

  useEffect(() => {
    webscoketRef.current = new WebSocket(`ws://${location.host}/socket`);

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
      dispatch(socketMsg);
    });

    webscoketRef.current.addEventListener("error", () => {
      navigate("/");
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
  const discardWithHidden: Array<Card | "Hidden"> = roomGameState.discard
    .map((card, index) => {
      if (roomGameState.gameState?.started && roomSizeRef.current < 2) {
        throw new Error("Game started with less than 2 players which should be impossible.");
      }

      if ((roomSizeRef.current === 2 && index < 3) || (roomSizeRef.current > 2 && index === 0)) {
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
    .reverse();

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

import { useParams } from "react-router-dom";
import { Game } from "../components/Game";
import { Lobby } from "../components/Lobby";
import { useGameState } from "../contexts/GameStateContext";
import { useAppbarText } from "../hooks/useAppbarText";
import { useDocTitle } from "../hooks/useDocTitle";

export const Room = () => {
  const { roomCode = "" } = useParams();
  const { gameState } = useGameState();
  useAppbarText(roomCode);
  useDocTitle(roomCode);

  return gameState?.started ? <Game /> : <Lobby roomCode={roomCode} />;
};

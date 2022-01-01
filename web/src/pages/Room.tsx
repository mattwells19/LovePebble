import { useParams } from "react-router-dom";
import { Game } from "../components/Game";
import { Lobby } from "../components/Lobby";
import { useAppbarText } from "../hooks/useAppbarText";
import { useDocTitle } from "../hooks/useDocTitle";

export const Room = () => {
  const { roomCode = "" } = useParams();
  useAppbarText(roomCode);
  useDocTitle(roomCode);

  const gameStarted = false;

  return gameStarted ? <Game /> : <Lobby roomCode={roomCode} />;
};

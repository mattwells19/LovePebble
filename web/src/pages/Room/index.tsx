import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router-dom";
import { GameStateProvider, useGameState } from "../../contexts/GameStateContext";
import { useSetAppbarText } from "../../contexts/AppbarContext";
import { DocTitle } from "../../components/DocTitle";
import { Game } from "./Game";
import { Lobby } from "./Lobby";

export const roomLoader = ({ params }: LoaderFunctionArgs) => {
  if (!params.roomCode) {
    return redirect("/");
  }

  if (!localStorage.getItem("playerName")) {
    return redirect(`/name?roomCode=${params.roomCode}`);
  }

  return params.roomCode;
};

const RoomUnwrapped = () => {
  const roomCode = useLoaderData() as string;
  const { gameState } = useGameState();
  useSetAppbarText(roomCode);

  return (
    <>
      <DocTitle>{roomCode}</DocTitle>
      {gameState?.started ? <Game /> : <Lobby roomCode={roomCode} />}
    </>
  );
};

export const Room = () => (
  <GameStateProvider>
    <RoomUnwrapped />
  </GameStateProvider>
);

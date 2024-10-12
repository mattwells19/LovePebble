import { type LoaderFunctionArgs, redirect, useLoaderData } from "react-router-dom";
import { GameStateProvider, useGameState } from "../../contexts/GameStateContext/index.ts";
import { useSetAppbarText } from "../../contexts/AppbarContext.tsx";
import { DocTitle } from "../../components/DocTitle.tsx";
import { Game } from "./Game.tsx";
import { Lobby } from "./Lobby.tsx";
import { RoundEnd } from "./RoundEnd.tsx";

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
  useSetAppbarText(roomCode);
  const { round, gameStarted } = useGameState();

  return (
    <>
      <DocTitle>{roomCode}</DocTitle>
      {!gameStarted ? <Lobby roomCode={roomCode} /> : round ? <Game /> : <RoundEnd />}
    </>
  );
};

export const Room = () => (
  <GameStateProvider>
    <RoomUnwrapped />
  </GameStateProvider>
);

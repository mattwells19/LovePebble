import { type LoaderFunctionArgs, redirect, useLoaderData } from "react-router-dom";
import { chakra } from "@chakra-ui/react";
import { GameStateProvider, useGameState } from "../../contexts/GameStateContext/index.ts";
import { useSetAppbarText } from "../../contexts/AppbarContext.tsx";
import { DocTitle } from "../../components/DocTitle.tsx";
import { Game } from "./Game/index.ts";
import { Lobby } from "./Lobby/index.ts";
import { RoundEnd } from "./RoundEnd.tsx";

export interface RoomLoaderResult {
  roomCode: string;
  playerName: string;
  userId: string | null;
}

export const roomLoader = ({ params }: LoaderFunctionArgs): RoomLoaderResult | Response => {
  if (!params.roomCode) {
    return redirect("/");
  }

  const playerName = localStorage.getItem("playerName");
  if (!playerName) {
    return redirect(`/name?roomCode=${params.roomCode}`);
  }

  const userId = sessionStorage.getItem("userId");

  return { roomCode: params.roomCode, playerName, userId };
};

const RoomUnwrapped = () => {
  const { roomCode } = useLoaderData() as RoomLoaderResult;
  useSetAppbarText(roomCode);
  const { round, gameStarted } = useGameState();

  return (
    <>
      <DocTitle>{roomCode}</DocTitle>
      <chakra.main display="flex" flexDir="column" alignItems="center" gap="6" py="6" px="4" width="sm" margin="auto">
        {!gameStarted ? <Lobby roomCode={roomCode} /> : round ? <Game /> : <RoundEnd />}
      </chakra.main>
    </>
  );
};

export const Room = () => {
  return (
    <GameStateProvider>
      <RoomUnwrapped />
    </GameStateProvider>
  );
};

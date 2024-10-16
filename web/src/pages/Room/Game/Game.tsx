import { Box } from "@chakra-ui/react";
import { useGameState } from "../../../contexts/GameStateContext/index.ts";
import { Deck } from "../../../components/Deck.tsx";
import { ActionHeading } from "../../../components/ActionHeading.tsx";
import { RoundLog } from "../../../components/RoundLog.tsx";
import { Discard } from "../../../components/Discard.tsx";
import { PlayerView } from "./views/PlayerView.tsx";
import { SpectatorView } from "./views/SpectatorView.tsx";

export const Game = () => {
  const { currentPlayerId, round, players } = useGameState();

  if (!round) {
    throw new Error("No round state on the game screen.");
  }

  const currentPlayer = players.get(currentPlayerId) ?? players.get(round.playerTurnId);
  if (!currentPlayer) {
    throw new Error(`Where'd they go???`);
  }

  return (
    <>
      <RoundLog />
      <ActionHeading />
      <Box display="flex" gap="3">
        <Deck />
        <Discard />
      </Box>
      {players.has(currentPlayerId) ? <PlayerView /> : <SpectatorView />}
    </>
  );
};

import type { ReactElement } from "react";
import { Box } from "@chakra-ui/react";
import { Card, SocketIncoming } from "@lovepebble/server";
import { PlayerPicker } from "./PlayerPicker.tsx";
import { CardPicker } from "./CardPicker.tsx";
import { SubmittedActionResult } from "./SubmittedActionResult.tsx";
import { CardSelection } from "./CardSelection.tsx";
import { Label } from "./Label.tsx";
import { useGameState } from "../contexts/GameStateContext/index.ts";

interface ActionSelectProps {
  playerCards: Array<Card>;
}

export const ActionSelect = (
  { playerCards }: ActionSelectProps,
): ReactElement | null => {
  const { gameState, sendGameUpdate, currentPlayerId } = useGameState();
  if (!gameState || !gameState.started || !gameState.details) {
    return null;
  }

  if ("submitted" in gameState.details === false || gameState.details.submitted === false) {
    return (
      <>
        {"chosenPlayerId" in gameState.details
          ? (
            <PlayerPicker
              value={gameState.details.chosenPlayerId}
            />
          )
          : null}
        {gameState.cardPlayed === Card.Guard
          ? (
            <CardPicker
              value={gameState.details.card}
            />
          )
          : null}
        {gameState.playerTurnId === currentPlayerId && gameState.cardPlayed === Card.Chancellor
          ? (
            <Box display="flex" flexDirection="column" gap="1" justifyContent="center">
              <Label>Pick one to keep</Label>
              <CardSelection
                cardOptions={[...gameState.details.deckOptions, ...playerCards]}
                htmlName="chancellor-choice"
                onChange={(cardSelection) => {
                  if (gameState.playerTurnId !== currentPlayerId) return;
                  sendGameUpdate({ type: SocketIncoming.SelectCard, cardSelected: cardSelection });
                }}
              />
            </Box>
          )
          : null}
      </>
    );
  }

  return <SubmittedActionResult />;
};

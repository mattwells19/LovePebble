import type { ReactElement } from "react";
import { Box } from "@chakra-ui/react";
import { useGameState } from "../contexts/GameStateContext/index.ts";
import { Card } from "@lovepebble/server";
import { Label } from "./Label.tsx";
import { CharacterCard } from "./CharacterCard.tsx";

export const SubmittedActionResult = (): ReactElement | null => {
  const { currentPlayerId, gameState, players } = useGameState();

  if (
    !gameState ||
    (gameState.cardPlayed !== Card.Priest && gameState.cardPlayed !== Card.Baron) ||
    !gameState.details.chosenPlayerId ||
    !gameState.details.submitted
  ) {
    return null;
  }

  const currentPlayer = players.get(gameState.playerTurnId)!;
  const chosenPlayer = players.get(gameState.details.chosenPlayerId)!;

  if (gameState.cardPlayed === Card.Priest && currentPlayerId === gameState.playerTurnId) {
    return (
      <Box display="flex" flexDirection="column" gap="1" alignItems="center">
        <Label>{chosenPlayer.name}'s card</Label>
        <CharacterCard character={chosenPlayer.cards[0]} />
      </Box>
    );
  } else if (
    gameState.cardPlayed === Card.Baron &&
    (currentPlayerId === gameState.playerTurnId || currentPlayerId === gameState.details.chosenPlayerId)
  ) {
    return (
      <Box display="flex" flexDirection="column" gap="1">
        <Label>
          {gameState.details.winningPlayerId === currentPlayerId ? "You won!" : "You lost."}
        </Label>
        <Box display="flex" gap="3" margin="auto">
          <CharacterCard character={currentPlayer.cards[0]} />
          <CharacterCard character={chosenPlayer.cards[0]} />
        </Box>
      </Box>
    );
  }

  return null;
};

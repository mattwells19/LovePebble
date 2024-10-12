import type { ReactElement } from "react";
import { Box } from "@chakra-ui/react";
import { useGameState } from "../contexts/GameStateContext/index.ts";
import { Card } from "@lovepebble/server";
import { Label } from "./Label.tsx";
import { CharacterCard } from "./CharacterCard.tsx";

export const SubmittedActionResult = (): ReactElement | null => {
  const { currentPlayerId, round, players } = useGameState();

  if (
    !round ||
    (round.cardPlayed !== Card.Priest && round.cardPlayed !== Card.Baron) ||
    !round.details.chosenPlayerId ||
    !round.details.submitted
  ) {
    return null;
  }

  const currentPlayer = players.get(round.playerTurnId)!;
  const chosenPlayer = players.get(round.details.chosenPlayerId)!;

  if (round.cardPlayed === Card.Priest && currentPlayerId === round.playerTurnId) {
    return (
      <Box display="flex" flexDirection="column" gap="1" alignItems="center">
        <Label>{chosenPlayer.name}'s card</Label>
        <CharacterCard character={chosenPlayer.cards[0]} />
      </Box>
    );
  } else if (
    round.cardPlayed === Card.Baron &&
    (currentPlayerId === round.playerTurnId || currentPlayerId === round.details.chosenPlayerId)
  ) {
    return (
      <Box display="flex" flexDirection="column" gap="1">
        <Label>
          {round.details.winningPlayerId === currentPlayerId
            ? "You won!"
            : round.details.winningPlayerId === null
            ? "It's a tie!"
            : "You lost."}
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

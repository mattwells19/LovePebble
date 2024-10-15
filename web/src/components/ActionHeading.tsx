import type { ReactElement } from "react";
import { Heading } from "@chakra-ui/react";
import { useGameState } from "../contexts/GameStateContext/index.ts";
import { Characters } from "./CharacterCard.tsx";

export const ActionHeading = (): ReactElement | null => {
  const { round, players, currentPlayerId } = useGameState();

  if (!round) return null;
  const playerName = players.get(round.playerTurnId)?.name ?? "Someone";

  return (
    <Heading as="h2" textAlign="center">
      {round.cardPlayed
        ? (
          <>
            {playerName} played {Characters[round.cardPlayed]}
          </>
        )
        : round.playerTurnId === currentPlayerId
        ? (
          <>
            {"It's your turn!"}
            <br />
            {"Select a card to play"}
          </>
        )
        : (
          `It's ${playerName}'s turn.`
        )}
    </Heading>
  );
};

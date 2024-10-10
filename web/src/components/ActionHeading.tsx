import type { ReactElement } from "react";
import { Heading } from "@chakra-ui/react";
import { useGameState } from "../contexts/GameStateContext/index.ts";
import { Characters } from "./CharacterCard.tsx";

export const ActionHeading = (): ReactElement | null => {
  const { gameState, players, currentPlayerId } = useGameState();

  if (!gameState || !gameState.started) return null;
  const playerName = players.get(gameState.playerTurnId)?.name ?? "Someone";

  return (
    <>
      {gameState.lastMoveDescription
        ? (
          <Heading as="h2" textAlign="center">
            {gameState.lastMoveDescription}
          </Heading>
        )
        : null}
      <Heading as="h2" textAlign="center">
        {gameState.cardPlayed
          ? (
            <>
              {playerName} played {Characters[gameState.cardPlayed]}
            </>
          )
          : gameState.playerTurnId === currentPlayerId
          ? (
            <>
              {"It's your turn!"}
              <br />
              {"Select a card to play"}
            </>
          )
          : (
            `It's ${players.get(gameState.playerTurnId ?? "")?.name}'s turn.`
          )}
      </Heading>
    </>
  );
};

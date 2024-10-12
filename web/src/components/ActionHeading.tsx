import type { ReactElement } from "react";
import { Heading } from "@chakra-ui/react";
import { useGameState } from "../contexts/GameStateContext/index.ts";
import { Characters } from "./CharacterCard.tsx";

export const ActionHeading = (): ReactElement | null => {
  const { gameState, gameLog, players, currentPlayerId } = useGameState();

  if (!gameState || !gameState.started) return null;
  const playerName = players.get(gameState.playerTurnId)?.name ?? "Someone";

  const lastMove = gameLog.at(-1);

  return (
    <>
      {lastMove
        ? (
          <Heading as="h2" textAlign="center">
            {lastMove}
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
            `It's ${playerName}'s turn.`
          )}
      </Heading>
    </>
  );
};

import { useState } from "react";
import { Box, Heading } from "@chakra-ui/react";
import { useGameState } from "../../contexts/GameStateContext";
import { CharacterCard } from "../../components/CharacterCard";
import { Label } from "../../components/Label";
import { Deck } from "../../components/Deck";
import { DiscardDrawer } from "../../components/DiscardDrawer";
import { PlayerPicker } from "../../components/PlayerPicker";
import PlayerHand from "../../components/PlayerHand";

export const Game = () => {
  const { deckCount, currentPlayerId, gameState, players, discard } = useGameState();
  const [showDiscardDrawer, setShowDiscardDrawer] = useState<boolean>(false);

  if (!gameState) throw new Error("No game state on the game screen.");

  return (
    <>
      {gameState.lastMoveDescription ? <Heading as="h2">{gameState.lastMoveDescription}</Heading> : null}
      <Heading as="h2" textAlign="center">
        {gameState.playerTurnId === currentPlayerId ? (
          <>
            {"It's your turn!"}
            <br />
            {"Select a card to play"}
          </>
        ) : (
          `It's ${players.get(gameState.playerTurnId ?? "")?.name}'s turn.`
        )}
      </Heading>
      <Box display="flex" gap="3">
        <Box display="flex" flexDirection="column" gap="1">
          <Label>Deck</Label>
          <Deck deckCount={deckCount} />
        </Box>
        <Box display="flex" flexDirection="column" gap="1">
          <Label>Discard</Label>
          <CharacterCard
            button
            title="Show discard pile."
            character={discard[0]}
            onClick={() => setShowDiscardDrawer(true)}
          />
        </Box>
      </Box>
      {
        <Box display="flex" flexDirection="column" gap="1">
          <Label>Your cards</Label>
          <Box display="flex" gap="3">
            <PlayerHand
              isPlayersTurn={gameState.playerTurnId === currentPlayerId}
              playerCards={players.get(currentPlayerId)?.cards ?? []}
            />
          </Box>
        </Box>
      }
      {gameState.started && gameState.details && "chosenPlayerId" in gameState.details ? (
        <PlayerPicker value={gameState.details.chosenPlayerId} />
      ) : null}
      <DiscardDrawer open={showDiscardDrawer} onClose={() => setShowDiscardDrawer(false)} />
    </>
  );
};

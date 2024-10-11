import { Box, chakra, useToast } from "@chakra-ui/react";
import { useGameState } from "../../contexts/GameStateContext/index.ts";
import { Label } from "../../components/Label.tsx";
import { Deck } from "../../components/Deck.tsx";
import PlayerHand from "../../components/PlayerHand.tsx";
import { ActionHeading } from "../../components/ActionHeading.tsx";
import { BigSubmitButton } from "../../components/BigSubmitButton.tsx";
import { SocketIncoming } from "@lovepebble/server";
import { ActionSelect } from "../../components/ActionSelection.tsx";
import { Discard } from "../../components/Discard.tsx";

export const Game = () => {
  const { currentPlayerId, gameState, players, sendGameUpdate } = useGameState();
  const toast = useToast();

  if (!gameState || !gameState.started) {
    throw new Error("No game state on the game screen.");
  }

  const confirmSelections = (formData: FormData) => {
    if (currentPlayerId !== gameState.playerTurnId) return;

    if (!gameState.cardPlayed) {
      const selectedCard = formData.get("card-to-play")?.toString();
      if (!selectedCard) {
        toast({
          title: "Select a card to play, then hit OK",
          variant: "solid",
          status: "error",
        });
        return;
      }
      sendGameUpdate({ type: SocketIncoming.PlayCard, cardPlayed: parseInt(selectedCard, 10) });
    } else if (gameState.details && "submitted" in gameState.details && gameState.details.submitted) {
      sendGameUpdate({ type: SocketIncoming.AcknowledgeAction });
    } else {
      sendGameUpdate({ type: SocketIncoming.SubmitSelection });
    }
  };

  return (
    <>
      <ActionHeading />
      <Box display="flex" gap="3">
        <Deck />
        <Discard />
      </Box>
      <chakra.form
        action={confirmSelections}
        width="full"
        display="flex"
        flexDir="column"
        gap="inherit"
        paddingBottom="20"
      >
        {players.get(currentPlayerId)!.cards.length > 0
          ? (
            <PlayerHand
              isPlayersTurn={gameState.playerTurnId === currentPlayerId}
              hasPlayedCard={!!gameState.cardPlayed}
              playerCards={players.get(currentPlayerId)?.cards ?? []}
            />
          )
          : <Label>{`Sit tight. You're out of this round.`}</Label>}
        <ActionSelect
          playerCards={players.get(currentPlayerId)?.cards ?? []}
        />
        {currentPlayerId === gameState.playerTurnId ? <BigSubmitButton /> : null}
      </chakra.form>
    </>
  );
};

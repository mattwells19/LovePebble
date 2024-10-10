import { Box, chakra, useDisclosure, useToast } from "@chakra-ui/react";
import { useGameState } from "../../contexts/GameStateContext/index.ts";
import { CharacterCard } from "../../components/CharacterCard.tsx";
import { Label } from "../../components/Label.tsx";
import { Deck } from "../../components/Deck.tsx";
import { DiscardDrawer } from "../../components/DiscardDrawer.tsx";
import { PlayerPicker } from "../../components/PlayerPicker.tsx";
import PlayerHand from "../../components/PlayerHand.tsx";
import { ActionHeading } from "../../components/ActionHeading.tsx";
import { BigSubmitButton } from "../../components/BigSubmitButton.tsx";
import { SocketIncoming } from "@lovepebble/server";
import { CardPicker } from "../../components/CardPicker.tsx";
import { SubmittedActionResult } from "../../components/SubmittedActionResult.tsx";

export const Game = () => {
  const { deckCount, currentPlayerId, gameState, players, discard, sendGameUpdate } = useGameState();
  const { isOpen, onClose, getButtonProps, getDisclosureProps } = useDisclosure();
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
            {...getButtonProps()}
          />
        </Box>
      </Box>
      <chakra.form
        action={confirmSelections}
        width="full"
        display="flex"
        flexDir="column"
        gap="inherit"
        paddingBottom="20"
      >
        <Box display="flex" flexDirection="column" gap="1">
          {players.get(currentPlayerId)!.cards.length > 0
            ? (
              <>
                <Label>Your cards</Label>
                <Box display="flex" gap="3" margin="auto">
                  <PlayerHand
                    isPlayersTurn={gameState.playerTurnId === currentPlayerId}
                    hasPlayedCard={!!gameState.cardPlayed}
                    playerCards={players.get(currentPlayerId)?.cards ?? []}
                  />
                </Box>
              </>
            )
            : <Label>{`Site tight. You're out of this round.`}</Label>}
        </Box>
        {gameState.details
          ? (
            <>
              {"submitted" in gameState.details === false ||
                  gameState.details.submitted === false
                ? (
                  <>
                    {"chosenPlayerId" in gameState.details
                      ? (
                        <PlayerPicker
                          value={gameState.details.chosenPlayerId}
                        />
                      )
                      : null}
                    {"card" in gameState.details ? <CardPicker value={gameState.details.card} /> : null}
                  </>
                )
                : <SubmittedActionResult />}
            </>
          )
          : null}
        {currentPlayerId === gameState.playerTurnId ? <BigSubmitButton /> : null}
      </chakra.form>
      <DiscardDrawer
        discard={discard}
        isOpen={isOpen}
        onClose={onClose}
        {...getDisclosureProps()}
      />
    </>
  );
};

import { Box, chakra, useDisclosure, useToast } from "@chakra-ui/react";
import { useGameState } from "../../contexts/GameStateContext";
import { CharacterCard } from "../../components/CharacterCard";
import { Label } from "../../components/Label";
import { Deck } from "../../components/Deck";
import { DiscardDrawer } from "../../components/DiscardDrawer";
import { PlayerPicker } from "../../components/PlayerPicker";
import PlayerHand from "../../components/PlayerHand";
import { ActionHeading } from "../../components/ActionHeading";
import { BigSubmitButton } from "../../components/BigSubmitButton";
import { SocketIncoming } from "../../../../server/types/socket.types";
import { Card } from "../../../../server/types/types";
import { CardPicker } from "../../components/CardPicker";

export const Game = () => {
  const { deckCount, currentPlayerId, gameState, players, discard, sendGameUpdate } = useGameState();
  const { isOpen, onClose, getButtonProps, getDisclosureProps } = useDisclosure();
  const toast = useToast();

  if (!gameState || !gameState.started) throw new Error("No game state on the game screen.");

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
    } else {
      if (gameState.details && "chosenPlayerId" in gameState.details) {
        const playerSelect = formData.get("playerSelect")?.toString();
        if (!playerSelect) {
          toast({
            title: "Select a player",
            variant: "solid",
            status: "error",
          });
          return;
        }
      }

      if (gameState.details && gameState.cardPlayed === Card.Guard) {
        const cardSelect = formData.get("cardSelect")?.toString();
        if (!cardSelect) {
          toast({
            title: "Select a character to guess",
            variant: "solid",
            status: "error",
          });
          return;
        }
      }

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
          <CharacterCard button title="Show discard pile." character={discard[0]} {...getButtonProps()} />
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
          <Label>Your cards</Label>
          <Box display="flex" gap="3" margin="auto">
            <PlayerHand
              isPlayersTurn={gameState.playerTurnId === currentPlayerId}
              hasPlayedCard={!!gameState.cardPlayed}
              playerCards={players.get(currentPlayerId)?.cards ?? []}
            />
          </Box>
        </Box>
        {gameState.details && "chosenPlayerId" in gameState.details ? (
          <PlayerPicker value={gameState.details.chosenPlayerId} />
        ) : null}
        {gameState.details && gameState.cardPlayed === Card.Guard ? (
          <CardPicker value={gameState.details.card} />
        ) : null}
        {currentPlayerId === gameState.playerTurnId ? <BigSubmitButton /> : null}
      </chakra.form>
      <DiscardDrawer discard={discard} isOpen={isOpen} onClose={onClose} {...getDisclosureProps()} />
    </>
  );
};

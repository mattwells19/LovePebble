import { chakra, useToast } from "@chakra-ui/react";
import { useGameState } from "../../../../contexts/GameStateContext/index.ts";
import { Label } from "../../../../components/Label.tsx";
import PlayerHand from "../../../../components/PlayerHand.tsx";
import { BigSubmitButton } from "../../../../components/BigSubmitButton.tsx";
import { Card, SocketIncoming } from "@lovepebble/server";
import { ActionSelect } from "../../../../components/ActionSelection.tsx";

export const PlayerView = () => {
  const { currentPlayerId, round, players, sendGameUpdate } = useGameState();
  const toast = useToast();

  if (!round) {
    throw new Error("No round state on the game screen.");
  }

  const currentPlayer = players.get(currentPlayerId);
  if (!currentPlayer) {
    throw new Error(`Where'd they go???`);
  }

  const confirmSelections = (formData: FormData) => {
    if (currentPlayerId !== round.playerTurnId) return;

    if (!round.cardPlayed) {
      const selectedCard = formData.get("card-to-play")?.toString();
      if (!selectedCard) {
        toast({
          title: "Select a card to play, then hit OK",
          variant: "solid",
          status: "error",
        });
        return;
      }

      const cardPlayed = parseInt(selectedCard, 10);
      if (
        currentPlayer.cards.includes(Card.Countess) &&
        (currentPlayer.cards.includes(Card.Prince) || currentPlayer.cards.includes(Card.King)) &&
        cardPlayed !== Card.Countess
      ) {
        toast({
          title: "You must play the Countess if your other card is a King or Prince!",
          variant: "solid",
          status: "error",
        });
        return;
      }

      sendGameUpdate({ type: SocketIncoming.PlayCard, cardPlayed });
    } else if (round.details && "submitted" in round.details && round.details.submitted) {
      sendGameUpdate({ type: SocketIncoming.AcknowledgeAction });
    } else {
      sendGameUpdate({ type: SocketIncoming.SubmitSelection });
    }
  };

  return (
    <chakra.form
      action={confirmSelections}
      width="full"
      display="flex"
      flexDir="column"
      gap="inherit"
      paddingBottom="20"
    >
      {currentPlayer.cards.length > 0
        ? (
          <PlayerHand
            isPlayersTurn={round.playerTurnId === currentPlayerId}
            hasPlayedCard={!!round.cardPlayed}
            playerCards={currentPlayer.cards}
          />
        )
        : <Label>{`Sit tight. You're out of this round.`}</Label>}
      <ActionSelect
        playerCards={currentPlayer.cards}
      />
      {currentPlayerId === round.playerTurnId ? <BigSubmitButton /> : null}
    </chakra.form>
  );
};

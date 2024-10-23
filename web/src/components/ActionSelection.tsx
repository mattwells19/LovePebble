import { type ReactElement, useLayoutEffect } from "react";
import { Box } from "@chakra-ui/react";
import { Card, SocketIncoming } from "@lovepebble/server";
import { PlayerPicker } from "./PlayerPicker.tsx";
import { CardPicker } from "./CardPicker.tsx";
import { SubmittedActionResult } from "./SubmittedActionResult.tsx";
import { CardSelection } from "./CardSelection.tsx";
import { Label } from "./Label.tsx";
import { useGameState } from "../contexts/GameStateContext/index.ts";

interface ActionSelectProps {
  playerCards: Array<Card>;
}

export const ActionSelect = (
  { playerCards }: ActionSelectProps,
): ReactElement | null => {
  const { round, sendGameUpdate, currentPlayerId } = useGameState();

  useLayoutEffect(() => {
    if (round?.details) {
      globalThis.scrollTo({ behavior: "smooth", top: document.body.scrollHeight });
    }
  }, [!!round?.details]);

  if (!round || !round.details) {
    return null;
  }

  if ("submitted" in round.details === false || round.details.submitted === false) {
    return (
      <>
        {"chosenPlayerId" in round.details
          ? (
            <PlayerPicker
              value={round.details.chosenPlayerId}
            />
          )
          : null}
        {round.cardPlayed === Card.Guard
          ? (
            <CardPicker
              value={round.details.card}
            />
          )
          : null}
        {round.playerTurnId === currentPlayerId && round.cardPlayed === Card.Chancellor
          ? (
            <Box display="flex" flexDirection="column" gap="1" justifyContent="center">
              <Label>Pick one to keep</Label>
              <CardSelection
                cardOptions={[...round.details.deckOptions, ...playerCards]}
                htmlName="chancellor-choice"
                onChange={(cardSelection) => {
                  if (round.playerTurnId !== currentPlayerId) return;
                  sendGameUpdate({ type: SocketIncoming.SelectCard, cardSelected: cardSelection });
                }}
              />
            </Box>
          )
          : null}
      </>
    );
  }

  return <SubmittedActionResult />;
};

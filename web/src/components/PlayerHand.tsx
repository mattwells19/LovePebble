import type { ReactElement } from "react";
import { css } from "@emotion/react";
import { Box, Button, Text, useToast, VisuallyHiddenInput } from "@chakra-ui/react";
import type { Card } from "../../../server/types/types";
import { CharacterCard, Characters } from "./CharacterCard";
import { useGameState } from "../contexts/GameStateContext";
import { SocketIncoming } from "../../../server/types/socket.types";

interface PlayerHandProps {
  isPlayersTurn: boolean;
  playerCards: Array<Card>;
}

const myLabel = css`
  cursor: pointer;

  .character-card {
    transition: outline linear 50ms;
  }

  &:hover .character-card {
    outline: 3px solid var(--chakra-colors-blue-200);
  }

  input:checked + .character-card {
    outline: 3px solid var(--chakra-colors-main-primaryOrange);
  }
`;

const PlayerHand = ({ isPlayersTurn, playerCards }: PlayerHandProps): ReactElement => {
  const { sendGameUpdate } = useGameState();
  const toast = useToast();
  if (!isPlayersTurn) {
    return (
      <>
        {playerCards.map((card) => (
          <CharacterCard key={card} character={card} />
        ))}
      </>
    );
  }

  const playCard = (formData: FormData) => {
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
  };

  return (
    <form action={playCard}>
      <Box as="fieldset" display="flex" gap="3">
        {playerCards.map((card) => (
          <Text as="label" key={card} tabIndex={0} css={myLabel}>
            <VisuallyHiddenInput
              id={`player-card-${card}`}
              type="radio"
              name="card-to-play"
              value={card}
              title={Characters[card]}
              tabIndex={-1}
            />
            <CharacterCard className="character-card" character={card} />
          </Text>
        ))}
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        position="absolute"
        left="0"
        bottom="0"
        width="full"
        padding="4"
        bg="main.lightPurple"
      >
        <Button type="submit" size="lg" textTransform="uppercase" width="xs">
          Ok
        </Button>
      </Box>
    </form>
  );
};

export default PlayerHand;

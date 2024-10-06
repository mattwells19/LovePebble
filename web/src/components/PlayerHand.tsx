import type { ReactElement } from "react";
import { css } from "@emotion/react";
import { Box, Text, VisuallyHiddenInput } from "@chakra-ui/react";
import type { Card } from "../../../server/types/types";
import { CharacterCard, Characters } from "./CharacterCard";

interface PlayerHandProps {
  isPlayersTurn: boolean;
  playerCards: Array<Card>;
  hasPlayedCard: boolean;
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

const PlayerHand = ({ isPlayersTurn, hasPlayedCard, playerCards }: PlayerHandProps): ReactElement => {
  if (!isPlayersTurn || hasPlayedCard) {
    return (
      <>
        {playerCards.map((card) => (
          <CharacterCard key={card} character={card} />
        ))}
      </>
    );
  }

  return (
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
  );
};

export default PlayerHand;

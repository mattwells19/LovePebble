import type { ReactElement } from "react";
import { Box, Text, VisuallyHiddenInput } from "@chakra-ui/react";
import { css } from "@emotion/react";
import type { Card } from "@lovepebble/server";
import { CharacterCard, Characters } from "./CharacterCard.tsx";

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

interface CardSelectionProps {
  cardOptions: Array<Card>;
  htmlName: string;
  onChange?: (selection: Card) => void;
}

export const CardSelection = ({ cardOptions, htmlName, onChange }: CardSelectionProps): ReactElement => {
  return (
    <Box as="fieldset" display="flex" gap="3" justifyContent="center" flexWrap="wrap">
      {cardOptions.map((card) => (
        <Text as="label" key={card} tabIndex={0} css={myLabel}>
          <VisuallyHiddenInput
            id={`${htmlName}-${card}`}
            type="radio"
            name={htmlName}
            value={card}
            title={Characters[card]}
            onChange={(e) => (e.target.checked && onChange ? onChange(card) : null)}
            tabIndex={-1}
          />
          <CharacterCard className="character-card" character={card} />
        </Text>
      ))}
    </Box>
  );
};

import type { ReactElement } from "react";
import { Box, Text } from "@chakra-ui/react";
import { Label } from "./Label.tsx";
import { useGameState } from "../contexts/GameStateContext/index.ts";
import { StackCards } from "./StackCards.tsx";

export const Deck = (): ReactElement => {
  const { deckCount } = useGameState();

  return (
    <Box display="flex" flexDirection="column" gap="1">
      <Label>Deck</Label>
      <Box position="relative">
        {deckCount > 0 ? <StackCards cards={Array.from({ length: deckCount })} /> : (
          <Box
            // should be same width/height as CharacterCard
            width="160px"
            height="236.6px"
          />
        )}
        <Box
          position="absolute"
          inset="0"
          margin="auto"
          width="14"
          height="14"
          backgroundColor="main.lightPurple"
          padding="4"
          borderRadius="md"
          opacity="0.7"
          role="presentation"
        />
        <Text
          as="p"
          position="absolute"
          inset="0"
          margin="auto"
          width="fit-content"
          height="fit-content"
          fontSize="xl"
        >
          {deckCount}
        </Text>
      </Box>
    </Box>
  );
};

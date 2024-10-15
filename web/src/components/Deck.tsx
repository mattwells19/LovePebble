import type { ReactElement } from "react";
import { Box, Text } from "@chakra-ui/react";
import { Label } from "./Label.tsx";
import { useGameState } from "../contexts/GameStateContext/index.ts";
import { CharacterCard } from "./CharacterCard.tsx";

export const Deck = (): ReactElement => {
  const { deckCount } = useGameState();

  return (
    <Box display="flex" flexDirection="column" gap="1">
      <Label>Deck</Label>
      <Box position="relative">
        {deckCount > 0
          ? (
            <CharacterCard
              position="absolute"
              boxShadow="-6px -6px 30px 0px rgba(0,0,0,0.3)"
              marginTop="1"
              marginLeft="1"
              role="presentation"
            />
          )
          : null}
        <CharacterCard />
        <Box
          position="absolute"
          inset="0"
          margin="auto"
          width="14"
          height="14"
          backgroundColor="gray.900"
          padding="4"
          borderRadius="md"
          opacity="0.5"
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

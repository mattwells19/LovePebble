import type { ReactElement } from "react";
import { Box, Text } from "@chakra-ui/react";
import { Label } from "./Label.tsx";
import { useGameState } from "../contexts/GameStateContext/index.ts";

export const Deck = (): ReactElement => {
  const { deckCount } = useGameState();
  // TODO: when we get art for the cards, see if there's a way to share this card container with CharacterCard
  return (
    <Box display="flex" flexDirection="column" gap="1">
      <Label>Deck</Label>
      <Box
        width="157px"
        height="220px"
        borderRadius="4px"
        background="gray.500"
        position="relative"
        overflow="hidden"
      >
        <Box
          clipPath="polygon(0 0, 0 25%, 33% 0)"
          width="100%"
          height="100%"
          backgroundColor="main.primaryOrange"
          borderRadius="4px"
          position="absolute"
          top="-1px"
          left="-1px"
          padding="6px 0 0 6px"
        >
          <Text as="span" color="main.darkPurple">
            {deckCount}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

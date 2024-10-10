import { Box, type BoxProps, Text } from "@chakra-ui/react";
import type { Card } from "@lovepebble/server";

interface CharacterCardProps extends BoxProps {
  /**
   * The character to show.
   * @default "Hidden" which will show face down.
   */
  character?: Card | "Hidden";
  button?: boolean;
}

export const Characters = [
  "Spy",
  "Guard",
  "Priest",
  "Baron",
  "Handmaid",
  "Prince",
  "Chancellor",
  "King",
  "Countess",
  "Princess",
] as const;

export const CharacterCard = ({ character = "Hidden", button, ...rest }: CharacterCardProps) => {
  return (
    <Box
      as={button ? "button" : undefined}
      width="157px"
      height="220px"
      borderRadius="4px"
      background="gray.500"
      display="grid"
      placeItems="center"
      flexShrink={0}
      {...rest}
    >
      {character !== "Hidden"
        ? (
          <Text fontWeight="bold" color="black">
            {Characters[character]} - {character}
          </Text>
        )
        : null}
    </Box>
  );
};

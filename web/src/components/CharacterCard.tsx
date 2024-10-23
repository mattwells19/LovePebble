import { Box, type BoxProps, Image, Text } from "@chakra-ui/react";
import type { Card } from "@lovepebble/server";

interface CharacterCardProps extends BoxProps {
  /**
   * The character to show.
   */
  character?: Card | null;
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

const CharacterImages = [
  "/character-images/spy.jpg",
  "/character-images/guard.jpg",
  "/character-images/priest.jpg",
  "/character-images/baron.jpg",
  "/character-images/handmaid.jpg",
  "/character-images/prince.jpg",
  "/character-images/chancellor.jpg",
  "/character-images/king.jpg",
  "/character-images/countess.jpg",
  "/character-images/princess.jpg",
];

const BackOfCard = "/character-images/back.jpg";

export const CharacterDescriptions = [
  "Gain favor if no one else plays/discards a spy",
  "Guess a hand",
  "Look at a hand",
  "Compare hands",
  "Immune to other cards until next turn",
  "Discard a hand & redraw",
  "Draw & return 2 cards",
  "Trade Hands",
  "Must play if you have King/Prince",
  "Out of the round if played/discarded",
];

export const CharacterCard = ({ character, button, ...rest }: CharacterCardProps) => {
  const cardColor = character ? `var(--${Characters[character].toLowerCase()})` : "main.darkPurple";

  return (
    <Box
      as={button ? "button" : undefined}
      borderRadius="4px"
      flexShrink={0}
      position="relative"
      border="2px solid"
      borderColor={cardColor}
      width="160px"
      height="236.6px"
      backgroundImage={BackOfCard}
      backgroundPosition="center"
      backgroundSize="cover"
      {...rest}
    >
      {typeof character === "number"
        ? (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              backgroundColor={cardColor}
              paddingX="3"
              fontWeight="bold"
              color="white"
              fontSize="lg"
              lineHeight="8"
            >
              <Text borderRadius="0 0 6px 0">
                {character}
              </Text>
              <Text borderRadius="0 0 0 6px">
                {Characters[character]}
              </Text>
            </Box>
            <Image
              alt={`A penguin in the style of the ${Characters[character]}`}
              src={CharacterImages[character]}
              width="full"
            />
            <Box
              backgroundColor={cardColor}
              position="absolute"
              bottom="0"
              width="full"
              paddingX="2"
              paddingY="1"
            >
              <Text fontSize="sm" textAlign="left">
                {CharacterDescriptions[character]}
              </Text>
            </Box>
          </>
        )
        : null}
    </Box>
  );
};

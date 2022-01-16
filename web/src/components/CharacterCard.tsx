import { Box, BoxProps, Text } from "@chakra-ui/react";
import { Card } from "../../../server/types/types";

interface CharacterCardProps extends BoxProps {
  character?: Card;
  button?: boolean;
}

const Characters = [
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
];

export const CharacterCard = ({ character, button, ...rest }: CharacterCardProps) => {
  return (
    <Box
      as={button ? "button" : undefined}
      width="157px"
      height="220px"
      borderRadius="4px"
      background="gray.500"
      display="grid"
      placeItems="center"
      {...rest}
    >
      {/* Need to be explicit since a Spy has a value of 0 which would be falsey */}
      {character !== undefined ? (
        <Text fontWeight="bold" color="black">
          {Characters[character]} - {character}
        </Text>
      ) : null}
    </Box>
  );
};

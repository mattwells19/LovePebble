import { Box, Text, VisuallyHiddenInput } from "@chakra-ui/react";
import { InputHTMLAttributes, ReactElement } from "react";
import { css } from "@emotion/react";
import { SocketIncoming } from "../../../server/types/socket.types";
import { Card } from "../../../server/types/types";
import { useGameState } from "../contexts/GameStateContext";
import { Characters } from "./CharacterCard";
import { Label } from "./Label";

const cardOptionClass = css`
  cursor: pointer;
  border-bottom: 2px solid var(--chakra-colors-main-greyAccent);
  user-select: none;

  &:last-of-type {
    border: none;
  }

  &:hover,
  &:focus-visible {
    background-color: var(--chakra-colors-main-darkPurple);
  }

  &:has(input:disabled) {
    cursor: not-allowed;
    background-color: var(--chakra-colors-main-greyAccent);

    &:hover,
    &:focus-visible {
      background-color: var(--chakra-colors-main-greyAccent);
    }
  }

  &:has(input:checked) {
    color: var(--chakra-colors-main-darkPurple);
    background-color: var(--chakra-colors-main-primaryOrange);

    &:hover,
    &:focus-visible {
      background-color: var(--chakra-colors-main-primaryOrange);
    }
  }
`;

const CardOption = ({ children, ...inputProps }: InputHTMLAttributes<HTMLInputElement>): ReactElement | null => {
  if (inputProps.value === Card.Guard) return null;

  const { color, count } = (() => {
    switch (inputProps.value) {
      case Card.Spy:
        return { color: "#535353", count: 2 };
      case Card.Priest:
        return { color: "#BABD3F", count: 2 };
      case Card.Baron:
        return { color: "#3FBD4C", count: 2 };
      case Card.Handmaid:
        return { color: "#3FBDB6", count: 2 };
      case Card.Prince:
        return { color: "#3F71BD", count: 2 };
      case Card.Chancellor:
        return { color: "#BD7B3F", count: 2 };
      case Card.King:
        return { color: "#423FBD", count: 1 };
      case Card.Countess:
        return { color: "#BD3FB8", count: 1 };
      case Card.Princess:
        return { color: "#BD3F3F", count: 1 };
      default:
        throw new Error("Unidentified card");
    }
  })();

  return (
    <Box as="label" fontSize="large" htmlFor={inputProps.id} css={cardOptionClass} tabIndex={0}>
      <VisuallyHiddenInput
        type="radio"
        tabIndex={-1}
        title={`${children} which has a value of ${inputProps.value} and appears ${count} times in the deck.`}
        {...inputProps}
      />
      <Box padding="1" display="flex" justifyContent="space-between">
        <Box display="flex" gap="3">
          <Box display="grid" placeItems="center" backgroundColor={color} borderRadius="md" width="25px">
            <Text as="span" color="whiteAlpha.900">
              {inputProps.value}
            </Text>
          </Box>
          {children}
        </Box>
        <Text as="span" paddingRight="1">
          x{count}
        </Text>
      </Box>
    </Box>
  );
};

export const CardPicker = ({ value }: { value: Card | null }) => {
  const { sendGameUpdate, currentPlayerId, gameState } = useGameState();

  const handleChange = (selectedCard: Card) => {
    if (gameState?.playerTurnId !== currentPlayerId) return;

    sendGameUpdate({ type: SocketIncoming.SelectCard, cardSelected: selectedCard });
  };

  return (
    <Box as="fieldset">
      <Label as="legend" display="block" margin="auto" marginBottom="1">
        Choose a Card
      </Label>
      <Box
        display="flex"
        flexDirection="column"
        width="full"
        border="2px solid"
        borderColor="main.greyAccent"
        borderRadius="lg"
        overflow="hidden"
      >
        {Characters.map((character, cardValue) => (
          <CardOption
            key={character}
            name="cardSelect"
            id={character}
            value={cardValue}
            onChange={(e) => (e.target.checked ? handleChange(cardValue) : null)}
            checked={cardValue === value}
            readOnly={currentPlayerId !== gameState?.playerTurnId}
            disabled={character === "Guard"}
          >
            {character}
          </CardOption>
        ))}
      </Box>
    </Box>
  );
};

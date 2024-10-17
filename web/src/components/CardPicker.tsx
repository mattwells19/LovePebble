import { Box, Text, VisuallyHiddenInput } from "@chakra-ui/react";

import type { InputHTMLAttributes, ReactElement } from "react";
import { css } from "@emotion/react";
import { Card, SocketIncoming } from "@lovepebble/server";
import { useGameState } from "../contexts/GameStateContext/index.ts";
import { Characters } from "./CharacterCard.tsx";
import { Label } from "./Label.tsx";

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

  &:has(input[readonly]) {
    cursor: not-allowed;

    &:hover,
    &:focus-visible {
      background-color: inherit;
    }
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
        return { color: "var(--spy)", count: 2 };
      case Card.Priest:
        return { color: "var(--priest)", count: 2 };
      case Card.Baron:
        return { color: "var(--baron)", count: 2 };
      case Card.Handmaid:
        return { color: "var(--handmaid)", count: 2 };
      case Card.Prince:
        return { color: "var(--prince)", count: 2 };
      case Card.Chancellor:
        return { color: "var(--chancellor)", count: 2 };
      case Card.King:
        return { color: "var(--king)", count: 1 };
      case Card.Countess:
        return { color: "var(--countess)", count: 1 };
      case Card.Princess:
        return { color: "var(--princess)", count: 1 };
      default:
        throw new Error("Unidentified card");
    }
  })();

  return (
    <Box
      as="label"
      fontSize="large"
      htmlFor={inputProps.id}
      css={cardOptionClass}
      tabIndex={0}
    >
      <VisuallyHiddenInput
        type="radio"
        tabIndex={-1}
        title={`${children} which has a value of ${inputProps.value} and appears ${count} times in the deck.`}
        {...inputProps}
      />
      <Box padding="1" display="flex" justifyContent="space-between">
        <Box display="flex" gap="3">
          <Box
            display="grid"
            placeItems="center"
            backgroundColor={color}
            borderRadius="md"
            width="25px"
          >
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

interface CardPickerProps {
  value: Card | null;
}

export const CardPicker = ({ value }: CardPickerProps) => {
  const { sendGameUpdate, currentPlayerId, players, round } = useGameState();

  const playerTurnName = (round ? players.get(round.playerTurnId)?.name : null) ?? "Someone";

  const handleChange = (selectedCard: Card) => {
    if (round?.playerTurnId !== currentPlayerId) return;

    sendGameUpdate({ type: SocketIncoming.SelectCard, cardSelected: selectedCard });
  };

  return (
    <Box as="fieldset">
      <Label as="legend" display="block" margin="auto" marginBottom="1">
        {round?.playerTurnId === currentPlayerId
          ? (
            "Choose a player"
          )
          : (
            `${playerTurnName} is choosing a card to guess`
          )}
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
            readOnly={currentPlayerId !== round?.playerTurnId}
            disabled={character === "Guard"}
          >
            {character}
          </CardOption>
        ))}
      </Box>
    </Box>
  );
};

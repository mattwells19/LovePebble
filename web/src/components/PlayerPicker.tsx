import { Box, Text, VisuallyHiddenInput } from "@chakra-ui/react";
import type { InputHTMLAttributes, ReactElement } from "react";
import { css } from "@emotion/react";
import { Card, type PlayerId, SocketIncoming } from "@lovepebble/server";
import { useGameState } from "../contexts/GameStateContext/index.ts";
import { Label } from "./Label.tsx";

const playerOpionClass = css`
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

const playerOptionStatusIconClass = css`
  position: absolute;
  inset: 0px 0px 0px var(--chakra-space-2);
  width: fit-content;
  height: fit-content;
  margin: auto 0px;
`;

interface PlayerOptionProps extends InputHTMLAttributes<HTMLInputElement> {
  isOutOfRound: boolean;
  isProtected: boolean;
}

const PlayerOption = ({ children, isOutOfRound, isProtected, ...inputProps }: PlayerOptionProps): ReactElement => {
  return (
    <Box
      as="label"
      fontSize="large"
      htmlFor={inputProps.id}
      css={playerOpionClass}
      tabIndex={0}
    >
      <VisuallyHiddenInput
        type="radio"
        tabIndex={-1}
        {...inputProps}
        disabled={inputProps.disabled || isOutOfRound || isProtected}
      />
      <Box paddingY="1.5" position="relative">
        <Text
          as="span"
          aria-hidden="true"
          role="presentation"
          css={playerOptionStatusIconClass}
        >
          {isOutOfRound
            ? (
              "💀"
            )
            : isProtected
            ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
              >
                <path d="M3.78307 2.82598L12 1L20.2169 2.82598C20.6745 2.92766 21 3.33347 21 3.80217V13.7889C21 15.795 19.9974 17.6684 18.3282 18.7812L12 23L5.6718 18.7812C4.00261 17.6684 3 15.795 3 13.7889V3.80217C3 3.33347 3.32553 2.92766 3.78307 2.82598Z">
                </path>
              </svg>
            )
            : null}
        </Text>
        {children}
      </Box>
    </Box>
  );
};

export const PlayerPicker = ({ value }: { value: PlayerId | null }) => {
  const { players, sendGameUpdate, currentPlayerId, round } = useGameState();

  const playerTurnName = (round ? players.get(round.playerTurnId)?.name : null) ?? "Someone";

  const handleChange = (selectedPlayerId: PlayerId) => {
    if (round?.playerTurnId !== currentPlayerId) return;

    sendGameUpdate({ playerSelected: selectedPlayerId, type: SocketIncoming.SelectPlayer });
  };

  return (
    <Box as="fieldset">
      <Label as="legend" display="block" margin="auto" marginBottom="1">
        {round?.playerTurnId === currentPlayerId
          ? (
            "Choose a player"
          )
          : (
            `${playerTurnName} is choosing a player`
          )}
      </Label>
      <Box
        display="flex"
        flexDirection="column"
        width="full"
        textAlign="center"
        border="2px solid"
        borderColor="main.greyAccent"
        borderRadius="lg"
        overflow="hidden"
      >
        {Array.from(players, ([playerId, player]) => (
          <PlayerOption
            key={playerId}
            name="playerSelect"
            id={playerId}
            value={player.name}
            onChange={(e) => (e.target.checked ? handleChange(playerId) : null)}
            checked={playerId === value}
            readOnly={currentPlayerId !== round?.playerTurnId}
            // You can only pick yourself when playing a Prince
            disabled={playerId === round?.playerTurnId && round.cardPlayed !== Card.Prince}
            isOutOfRound={player.outOfRound}
            isProtected={player.handmaidProtected}
          >
            {player.name}
          </PlayerOption>
        ))}
      </Box>
    </Box>
  );
};

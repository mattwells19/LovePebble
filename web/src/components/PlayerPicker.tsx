import { Box, Text, useRadio } from "@chakra-ui/react";
import { FC, InputHTMLAttributes, useState } from "react";
import { SocketIncoming } from "../../../server/types/socket.types";
import { PlayerId } from "../../../server/types/types";
import { useGameState } from "../contexts/GameStateContext";

const disabledStyles = {
  color: "main.greyAccent",
};

const checkedStyles = {
  backgroundColor: "main.darkPurple",
};

const PlayerOption: FC<InputHTMLAttributes<HTMLInputElement>> = ({ children, ...inputProps }) => {
  const { getInputProps } = useRadio();
  const [focused, setFocused] = useState<boolean>(false);

  return (
    <Box
      as="label"
      fontSize="large"
      borderBottom="2px solid"
      borderColor="main.greyAccent"
      htmlFor={inputProps.id}
      sx={{
        "&:last-of-type": {
          borderColor: "transparent",
        },
        ...(inputProps.disabled ? disabledStyles : {}),
        ...(inputProps.checked ? checkedStyles : {}),
      }}
    >
      {/* getInputProps used for styling to hide the HTML circle */}
      <input
        type="radio"
        {...getInputProps()}
        {...inputProps}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <Box aria-hidden="true" cursor={inputProps.disabled ? "not-allowed" : "pointer"} paddingY="1" position="relative">
        {focused ? (
          <Text as="span" position="absolute" left="1">
            ▶️
          </Text>
        ) : null}
        {children}
      </Box>
    </Box>
  );
};

export const PlayerPicker = ({ value }: { value: PlayerId | null }) => {
  const { players, sendGameUpdate, currentPlayerId, gameState } = useGameState();

  const handleChange = (selectedPlayerId: PlayerId) => {
    sendGameUpdate({ playerSelected: selectedPlayerId, type: SocketIncoming.SelectPlayer });
  };

  const isSelecting = gameState?.playerTurnId === currentPlayerId;

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="full"
      textAlign="center"
      border="2px solid"
      borderColor="main.greyAccent"
      borderRadius="lg"
      role="group"
      overflow="hidden"
    >
      {Array.from(players, ([playerId, player]) => (
        <PlayerOption
          key={playerId}
          name="playerSelect"
          id={playerId}
          value={player.name}
          onChange={isSelecting ? (e) => (e.target.checked ? handleChange(playerId) : null) : () => null}
          checked={playerId === value}
          readOnly={currentPlayerId !== gameState?.playerTurnId}
        >
          {player.name}
        </PlayerOption>
      ))}
    </Box>
  );
};

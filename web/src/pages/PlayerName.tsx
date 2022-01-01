import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppbarText } from "../hooks/useAppbarText";
import { useDocTitle } from "../hooks/useDocTitle";

export const PlayerName = () => {
  const navigate = useNavigate();
  useAppbarText("Player Name");
  useDocTitle("Player Name");
  const [searchParams] = useSearchParams();
  const [playerName, setPlayerName] = useState<string>(localStorage.getItem("playerName") ?? "");
  const [error, setError] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const roomCode = searchParams.get("roomCode");

    const trimmedPlayerName = playerName.trim();
    if (trimmedPlayerName.length === 0 || trimmedPlayerName.length > 15) setError(true);
    else {
      localStorage.setItem("playerName", trimmedPlayerName);
      navigate(roomCode ? `/room/${roomCode}` : "/");
    }
  };

  return (
    <Box as="form" marginX="auto" marginY="8" width="sm" onSubmit={handleSubmit}>
      <FormControl isRequired isInvalid={error} id="name">
        <FormLabel>Your Name</FormLabel>
        <Box display="flex" gridGap="3">
          <Input
            autoFocus
            value={playerName}
            maxLength={15}
            // placeholder=""
            onChange={(e) => {
              if (error) setError(false);
              setPlayerName(e.target.value);
            }}
            textAlign="center"
          />
          <Button type="submit" width="24">
            Save
          </Button>
        </Box>
        <FormErrorMessage>
          Please enter a valid name.
          <br />
          Max characters: 15
        </FormErrorMessage>
      </FormControl>
    </Box>
  );
};

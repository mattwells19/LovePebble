import { Box, Button, ButtonGroup, Divider, FormControl, FormHelperText, Heading, List } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { type PlayerId, SocketIncoming } from "@lovepebble/server";
import { PlayerListItem } from "./components/PlayerListItem.tsx";
import { useGameState } from "../../../contexts/GameStateContext/index.ts";

interface LobbyProps {
  roomCode: string;
}

export const Lobby = ({ roomCode }: LobbyProps) => {
  const { players, spectators, currentPlayerId, sendGameUpdate } = useGameState();

  const handleStartGame = () => {
    sendGameUpdate({ type: SocketIncoming.StartGame });
  };

  const handleSwitchRole = (playerId: PlayerId) => {
    sendGameUpdate({ type: SocketIncoming.SwitchRole, playerId });
  };

  return (
    <Box width="full" display="flex" flexDirection="column" gap="4">
      <Heading as="h2" textAlign="center">
        Players
      </Heading>
      <List>
        {Array.from(players, ([playerId, player]) => (
          <PlayerListItem
            key={playerId}
            isCurrentPlayer={currentPlayerId === playerId}
            roomCode={roomCode}
            canSwitchRole
            onSwitchRole={() => handleSwitchRole(playerId)}
          >
            {player.name}
          </PlayerListItem>
        ))}
      </List>
      {spectators.size > 0
        ? (
          <>
            <Divider />
            <Heading as="h2" textAlign="center">
              Spectators
            </Heading>
            <List>
              {Array.from(spectators, ([spectatorId, spectatorName]) => (
                <PlayerListItem
                  key={spectatorId}
                  isCurrentPlayer={currentPlayerId === spectatorId}
                  roomCode={roomCode}
                  isSpectator
                  canSwitchRole={players.size < 6}
                  onSwitchRole={() => handleSwitchRole(spectatorId)}
                >
                  {spectatorName}
                </PlayerListItem>
              ))}
            </List>
          </>
        )
        : null}
      <Divider />
      <FormControl display="flex" flexDirection="column">
        <ButtonGroup flexDirection="row" gap="2">
          <Button to="/" as={Link} variant="outline" flex="1">
            Leave Lobby
          </Button>
          <Button
            disabled={players.size < 2 || players.size > 6}
            flex="1"
            onClick={() => handleStartGame()}
          >
            Start Game
          </Button>
        </ButtonGroup>
        <Box textAlign="center">
          {players.size < 2 && (
            <FormHelperText>
              Need at least 2 players to start the game.
            </FormHelperText>
          )}
        </Box>
      </FormControl>
    </Box>
  );
};

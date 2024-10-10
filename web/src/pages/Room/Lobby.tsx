import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  FormControl,
  FormHelperText,
  Heading,
  IconButton,
  List,
  ListItem,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { SocketIncoming } from "@lovepebble/server";
import { useGameState } from "../../contexts/GameStateContext/index.ts";
import EditIcon from "../../icons/EditIcon.tsx";

interface LobbyProps {
  roomCode: string;
}

export const Lobby = ({ roomCode }: LobbyProps) => {
  const { players, currentPlayerId, sendGameUpdate } = useGameState();

  const handleStartGame = () => {
    sendGameUpdate({ type: SocketIncoming.StartGame });
  };

  return (
    <Box width="full" display="flex" flexDirection="column" gap="4">
      <Heading as="h2" textAlign="center">
        Players
      </Heading>
      <Divider />
      <List>
        {Array.from(players, ([playerId, player]) => (
          <ListItem
            key={playerId}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            height="40px"
          >
            {playerId === currentPlayerId
              ? (
                <>
                  <Text fontWeight="bold">{player.name}</Text>
                  <Tooltip label="Edit name.">
                    <IconButton
                      aria-label="Edit name."
                      as={Link}
                      to={`/name?roomCode=${roomCode}`}
                      icon={<EditIcon width="20px" />}
                      colorScheme="gray"
                      inset="0"
                      left="auto"
                      variant="ghost"
                      borderRadius="md"
                      minWidth="auto"
                      width="30px"
                      height="30px"
                    />
                  </Tooltip>
                </>
              )
              : <Text>{player.name}</Text>}
          </ListItem>
        ))}
      </List>
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
          {players.size > 6 && (
            <FormHelperText>
              Can only support a maximum of 6 players.
            </FormHelperText>
          )}
        </Box>
      </FormControl>
    </Box>
  );
};

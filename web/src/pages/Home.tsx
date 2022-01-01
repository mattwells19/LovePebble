import { useEffect, useState } from "react";
import { Text, Box, PinInput, PinInputField, Collapse, Alert, AlertIcon, Button, Divider } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAppbarText } from "../hooks/useAppbarText";
import { useRouterContext } from "../contexts/RouterContext";

export const Home = () => {
  const navigate = useNavigate();
  useAppbarText("Love Pebble");
  const { setNewRoomCode } = useRouterContext();

  const [roomCode, setRoomCode] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRoomCodeChange = (code: string) => {
    setError(false);
    setRoomCode(code.toUpperCase());
  };

  const handleNewRoomClick = () => {
    setLoading(true);
    fetch("/api/newRoom")
      .then((res) => res.text())
      .then((newRoomCode) => {
        setNewRoomCode(newRoomCode);
        navigate(`/room/${newRoomCode}`);
      });
  };

  useEffect(() => {
    if (roomCode.length === 4 && !error) {
      setLoading(true);
      fetch(`/api/checkRoom?roomCode=${roomCode}`)
        .then((res) => res.text())
        .then((data) => {
          const isValidRoom: boolean = JSON.parse(data);
          if (isValidRoom) {
            navigate(`/room/${roomCode}`);
          } else {
            setError(!isValidRoom);
            setLoading(false);
          }
        });
    }
  }, [roomCode]);

  return (
    <>
      <Text textAlign="left" width="full">
        Content
      </Text>
      <Divider />
      <Box display="flex" flexDirection="column" alignItems="center" gap="4">
        <Text>Already have a room code? Type/paste it here.</Text>
        <Box display="flex" gap="2">
          <PinInput
            autoFocus
            onChange={handleRoomCodeChange}
            value={roomCode}
            isInvalid={error}
            size="lg"
            type="alphanumeric"
          >
            <PinInputField aria-label="Room code, first letter." />
            <PinInputField aria-label="Room code, second letter." />
            <PinInputField aria-label="Room code, third letter." />
            <PinInputField aria-label="Room code, last letter." />
          </PinInput>
        </Box>
        <Collapse in={error} animateOpacity>
          <Alert status="warning" width="sm">
            <AlertIcon />
            There is no room with that room code. Try a different code or start a new room.
          </Alert>
        </Collapse>
      </Box>
      <Box display="flex" width="full" alignItems="center" gap="3">
        <Divider />
        <Text>or</Text>
        <Divider />
      </Box>
      <Button size="lg" isLoading={loading} onClick={handleNewRoomClick}>
        Start a New Room
      </Button>
    </>
  );
};

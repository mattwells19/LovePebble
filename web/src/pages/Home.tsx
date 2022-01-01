import { FC, useEffect, useState } from "react";
import { Text, Box, PinInput, PinInputField, Collapse, Alert, AlertIcon, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAppbarText } from "../hooks/useAppbarText";

export const Home: FC = () => {
  const navigate = useNavigate();
  useAppbarText("Love Pebble");

  const [roomCode, setRoomCode] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const handleRoomCodeChange = (code: string) => {
    setError(false);
    setRoomCode(code.toUpperCase());
  };

  const handleNewRoomClick = () => {
    fetch("/api/newRoom")
      .then((res) => res.text())
      .then((roomCode) => {
        navigate(`/room/${roomCode}`);
      });
  };

  useEffect(() => {
    if (roomCode.length === 4 && !error) {
      fetch(`/api/checkRoom?roomCode=${roomCode}`)
        .then((res) => res.text())
        .then((data) => {
          const isValidRoom: boolean = JSON.parse(data);
          if (isValidRoom) {
            navigate(`/room/${roomCode}`);
          } else {
            setError(!isValidRoom);
          }
        });
    }
  }, [roomCode]);

  return (
    <>
      <Text textAlign="left" width="full">
        Content
      </Text>
      <Box display="flex" flexDirection="column" alignItems="center" gap="4">
        <Text>Already have a room code? Type/paste it here.</Text>
        <Box>
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
      <Button onClick={handleNewRoomClick}>Start a new room</Button>
    </>
  );
};

import { useEffect, useState } from "react";
import { Text, Box, PinInput, PinInputField, Collapse, Alert, AlertIcon, Button, Divider } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAppbarText } from "../hooks/useAppbarText";
import { useRouterContext } from "../contexts/RouterContext";
import { get } from "../utils/get";
import { useDocTitle } from "../hooks/useDocTitle";

export const Home = () => {
  const navigate = useNavigate();
  useAppbarText("Love Pebble");
  useDocTitle();
  const { setNewRoomCode } = useRouterContext();

  const [roomCode, setRoomCode] = useState<string>("");
  const [error, setError] = useState<"invalidRoom" | "networkError" | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRoomCodeChange = (code: string) => {
    setError(null);
    setRoomCode(code.toUpperCase());
  };

  const handleNewRoomClick = () => {
    setLoading(true);
    get<string>("/api/newRoom")
      .then((newRoomCode) => {
        setNewRoomCode(newRoomCode);
        navigate(`/room/${newRoomCode}`);
      })
      .catch((errMsg: string) => {
        console.error(errMsg);
        setError("networkError");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (roomCode.length === 4 && !error) {
      setLoading(true);
      get<boolean>(`/api/checkRoom?roomCode=${roomCode}`)
        .then((isValidRoom) => {
          if (isValidRoom) {
            navigate(`/room/${roomCode}`);
          } else {
            setError("invalidRoom");
            setLoading(false);
          }
        })
        .catch((errMsg: string) => {
          console.error(errMsg);
          setLoading(false);
          setError("networkError");
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
            isInvalid={Boolean(error)}
            size="lg"
            type="alphanumeric"
          >
            <PinInputField aria-label="Room code, first letter." />
            <PinInputField aria-label="Room code, second letter." />
            <PinInputField aria-label="Room code, third letter." />
            <PinInputField aria-label="Room code, last letter." />
          </PinInput>
        </Box>
        <Collapse in={Boolean(error)} animateOpacity>
          <Alert status={error === "networkError" ? "error" : "warning"} width="sm">
            <AlertIcon />
            {error === "networkError"
              ? "There was a problem communicating with the server."
              : "There is no room with that room code. Try a different code or start a new room."}
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

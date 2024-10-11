import { useEffect, useRef, useState } from "react";
import { type ActionFunction, Form, redirect, useActionData, useNavigation, useSubmit } from "react-router-dom";
import { Alert, AlertIcon, Box, Button, Collapse, Divider, PinInput, PinInputField, Text } from "@chakra-ui/react";
import { useSetAppbarText } from "../contexts/AppbarContext.tsx";
import { get } from "../utils/get.ts";
import { DocTitle } from "../components/DocTitle.tsx";

export const homeAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  try {
    if (formData.get("intent")?.toString() === "createRoom") {
      const newRoomCode = await get<string>("/api/newRoom");
      return redirect(`/room/${newRoomCode}`);
    } else {
      const roomCode = [
        formData.get("roomCode-1")?.toString(),
        formData.get("roomCode-2")?.toString(),
        formData.get("roomCode-3")?.toString(),
        formData.get("roomCode-4")?.toString(),
      ].join("").toUpperCase();

      const isValidRoom = await get<boolean>(`/api/checkRoom?roomCode=${roomCode}`);
      return isValidRoom
        ? redirect(`/room/${roomCode}`)
        : `There is no room with that room code. Try a different code or start a new room.`;
    }
  } catch (errMsg) {
    console.error(errMsg);
    return "There was a problem communicating with the server.";
  }
};

export const Home = () => {
  const submit = useSubmit();
  const actionResponse = useActionData() as string | undefined;
  const { state } = useNavigation();

  useSetAppbarText("Love Pebble");
  const formRef = useRef<HTMLFormElement | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state === "idle") {
      setError(actionResponse ?? null);
    }
  }, [state === "idle", actionResponse]);

  return (
    <>
      <DocTitle />
      <Text textAlign="left" width="full">
        Content
      </Text>
      <Divider />
      <Box display="flex" flexDirection="column" alignItems="center" gap="4">
        <Text>Already have a room code? Type/paste it here.</Text>
        <Box as={Form} method="post" ref={formRef} display="flex" gap="2">
          <PinInput
            autoFocus
            onChange={() => setError(null)}
            onComplete={() => {
              submit(formRef.current);
            }}
            isInvalid={Boolean(error)}
            size="lg"
            type="alphanumeric"
          >
            <PinInputField
              aria-label="Room code, first letter."
              textTransform="uppercase"
              name="roomCode-1"
            />
            <PinInputField
              aria-label="Room code, second letter."
              textTransform="uppercase"
              name="roomCode-2"
            />
            <PinInputField
              aria-label="Room code, third letter."
              textTransform="uppercase"
              name="roomCode-3"
            />
            <PinInputField
              aria-label="Room code, last letter."
              textTransform="uppercase"
              name="roomCode-4"
            />
          </PinInput>
        </Box>
        <Collapse in={Boolean(error)} animateOpacity>
          <Alert
            status={error === "networkError" ? "error" : "warning"}
            width="sm"
          >
            <AlertIcon />
            {error}
          </Alert>
        </Collapse>
      </Box>
      <Box display="flex" width="full" alignItems="center" gap="3">
        <Divider />
        <Text>or</Text>
        <Divider />
      </Box>
      <Form method="post">
        <Button
          size="lg"
          disabled={state === "submitting"}
          name="intent"
          value="createRoom"
          type="submit"
        >
          Start a New Room
        </Button>
      </Form>
    </>
  );
};

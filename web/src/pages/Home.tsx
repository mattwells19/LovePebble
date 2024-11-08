import { useEffect, useRef, useState } from "react";
import { type ActionFunction, Form, redirect, useActionData, useNavigation, useSubmit } from "react-router-dom";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  chakra,
  Collapse,
  Divider,
  PinInput,
  PinInputField,
  Text,
  useToken,
} from "@chakra-ui/react";
import { RiGroupFill } from "@remixicon/react";
import { useSetAppbarText } from "../contexts/AppbarContext.tsx";
import { get } from "../utils/get.ts";
import { DocTitle } from "../components/DocTitle.tsx";

export const homeAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  try {
    if (formData.get("intent")?.toString() === "createRoom") {
      const newRoomCode = await get<string>("/api/rooms", { method: "post" });
      return redirect(`/room/${newRoomCode}`);
    } else {
      const roomCode = [
        formData.get("roomCode-1")?.toString(),
        formData.get("roomCode-2")?.toString(),
        formData.get("roomCode-3")?.toString(),
        formData.get("roomCode-4")?.toString(),
      ].join("").toUpperCase();

      const isValidRoom = await get<boolean>(`/api/rooms/${roomCode}`);
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
  const orange200 = useToken("colors", "orange.200");

  useSetAppbarText("Love Pebble");
  const formRef = useRef<HTMLFormElement | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state === "idle") {
      setError(actionResponse ?? null);
    }
  }, [state === "idle", actionResponse]);

  return (
    <chakra.main display="flex" flexDir="column" gap="6" py="6" alignItems="center" width="sm" margin="auto">
      <DocTitle />
      <Box display="flex" flexDirection="column" gap="4" alignItems="start" fontSize="lg" px="4">
        <Text textAlign="left" width="full">
          Welcome! This is an online, 6 player version of the popular card game Love Letter.
        </Text>
        <Text textAlign="left" width="full">
          The rules play just like the card game you'd buy in the store so grab your friends and get to loving!
        </Text>
        <Text textAlign="left" width="full">
          In Love Pebble, suitors compete to have their pebble delivered to the kingdom's princess, who is in need of a
          mate for the upcoming mating season.
        </Text>
        <Box
          display="flex"
          justifyContent="space-evenly"
          alignItems="center"
          paddingX="3"
          paddingY="1"
          gap="3"
          color="orange.200"
          border="1px solid"
          borderColor="orange.200"
          borderRadius="md"
          backgroundColor={`${orange200}10`}
          mt="1"
        >
          <RiGroupFill size="20px" />
          <Text>2 - 6 players</Text>
        </Box>
      </Box>
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
      <Box as={Form} method="post" width="fit-content">
        <Button
          size="lg"
          disabled={state === "submitting"}
          name="intent"
          value="createRoom"
          type="submit"
        >
          Start a New Room
        </Button>
      </Box>
    </chakra.main>
  );
};

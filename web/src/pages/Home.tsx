import { useEffect, useRef, useState } from "react";
import { type ActionFunction, Form, redirect, useActionData, useNavigation, useSubmit } from "react-router-dom";
import { Button, Divider } from "@chakra-ui/react";
import { PinInput } from "@ark-ui/react";
import { RiErrorWarningFill, RiGroupFill } from "@remixicon/react";

import { get } from "../utils/get.ts";
import { useSetAppbarText } from "../contexts/AppbarContext.tsx";
import { DocTitle } from "../components/DocTitle.tsx";

import styles from "../styles/pages/Home.module.scss";

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

  useSetAppbarText("Love Pebble");
  const formRef = useRef<HTMLFormElement | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state === "idle") {
      setError(actionResponse ?? null);
    }
  }, [state === "idle", actionResponse]);

  return (
    <main className={styles.main}>
      <DocTitle />
      <section className={styles.welcome_blurb}>
        <p>
          Welcome! This is an online, 6 player version of the popular card game Love Letter.
        </p>
        <p>
          The rules play just like the card game you'd buy in the store so grab your friends and get to loving!
        </p>
        <p>
          In Love Pebble, suitors compete to have their pebble delivered to the kingdom's princess, who is in need of a
          mate for the upcoming mating season.
        </p>
        <div className={styles.player_count_pill}>
          <RiGroupFill size="20px" />
          <span>2 - 6 players</span>
        </div>
      </section>
      <Divider />
      <section className={styles.room_code_pin_inputs_container}>
        <Form method="post" ref={formRef}>
          <PinInput.Root
            autoFocus
            onChange={() => setError(null)}
            onValueComplete={() => {
              submit(formRef.current);
            }}
            invalid={Boolean(error)}
            type="alphanumeric"
          >
            <PinInput.Label>Already have a room code? Type/paste it here.</PinInput.Label>
            <PinInput.Control>
              <PinInput.Input
                aria-label="Room code, first letter."
                name="roomCode-1"
                index={0}
              />
              <PinInput.Input
                aria-label="Room code, second letter."
                name="roomCode-2"
                index={1}
              />
              <PinInput.Input
                aria-label="Room code, third letter."
                name="roomCode-3"
                index={2}
              />
              <PinInput.Input
                aria-label="Room code, last letter."
                name="roomCode-4"
                index={3}
              />
            </PinInput.Control>
            <PinInput.HiddenInput />
          </PinInput.Root>
        </Form>
        {error
          ? (
            <div role="alert" className={styles.alert_container}>
              <RiErrorWarningFill size="24" />
              <span>
                {error}
              </span>
            </div>
          )
          : null}
      </section>
      <div className={styles.or_separator}>
        <Divider />
        <span>or</span>
        <Divider />
      </div>
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
    </main>
  );
};

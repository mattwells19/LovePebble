import { useEffect } from "react";
import { Button } from "@chakra-ui/react";
import { Field } from "@ark-ui/react";
import {
  type ActionFunction,
  Form,
  type LoaderFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
} from "react-router-dom";
import { useSetAppbarText } from "../contexts/AppbarContext.tsx";
import { DocTitle } from "../components/DocTitle.tsx";
import { toast } from "../components/Toaster.tsx";
import styles from "../styles/pages/PlayerName.module.scss";

export const playerNameLoader = ({ request }: LoaderFunctionArgs) => {
  const roomCode = new URL(request.url).searchParams.get("roomCode");
  const defaultName = localStorage.getItem("playerName");
  return { roomCode, defaultName };
};

export const playerNameAction: ActionFunction = async ({ request }) => {
  const playerName = (await request.formData()).get("playerName")?.toString() ?? "";
  const trimmedPlayerName = playerName.trim();

  if (trimmedPlayerName.length === 0 || trimmedPlayerName.length > 15) {
    return playerName;
  }

  localStorage.setItem("playerName", trimmedPlayerName);
  const roomCode = new URL(request.url).searchParams.get("roomCode");
  return redirect(roomCode ? `/room/${roomCode}` : "/");
};

export const PlayerName = () => {
  useSetAppbarText("Name");
  const { defaultName, roomCode } = useLoaderData() as ReturnType<typeof playerNameLoader>;
  const badName = useActionData() as string | undefined;

  useEffect(() => {
    if (typeof badName === "string") {
      toast({
        title: "Please enter a valid name. Max of 15 characters.",
        type: "error",
      });
    }
  }, [badName]);

  return (
    <main className={styles.main}>
      <DocTitle>Name</DocTitle>
      <Form method="post" className={styles.form}>
        <Field.Root required id="playerName">
          <Field.Label>Your Name</Field.Label>
          <div className={styles.input_group}>
            <Field.Input
              autoFocus
              defaultValue={badName ?? defaultName ?? undefined}
              maxLength={15}
              name="playerName"
              type="text"
            />
            {roomCode
              ? (
                <input
                  type="text"
                  hidden
                  value={roomCode}
                  name="roomCode"
                  readOnly
                />
              )
              : null}
            <Button type="submit" width="24">
              Save
            </Button>
          </div>
        </Field.Root>
      </Form>
    </main>
  );
};

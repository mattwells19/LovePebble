import { useEffect } from "react";
import {
  Box,
  Button,
  chakra,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  useToast,
  VisuallyHiddenInput,
} from "@chakra-ui/react";
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
  const toast = useToast();
  useSetAppbarText("Player Name");
  const { defaultName, roomCode } = useLoaderData() as ReturnType<typeof playerNameLoader>;
  const badName = useActionData() as string | undefined;

  useEffect(() => {
    if (typeof badName === "string") {
      toast({
        title: "Please enter a valid name. Max of 15 characters.",
        status: "error",
      });
    }
  }, [badName]);

  return (
    <chakra.main pt="12" pb="6" px="4" width="sm" margin="auto">
      <DocTitle>Player Name</DocTitle>
      <Box as={Form} method="post" width="fit-content">
        <FormControl isRequired id="playerName">
          <FormLabel>Your Name</FormLabel>
          <InputGroup gap="3">
            <Input
              autoFocus
              defaultValue={badName ?? defaultName ?? undefined}
              maxLength={15}
              textAlign="center"
              name="playerName"
            />
            {roomCode
              ? (
                <VisuallyHiddenInput
                  value={roomCode}
                  name="roomCode"
                  readOnly
                />
              )
              : null}
            <Button type="submit" width="24">
              Save
            </Button>
          </InputGroup>
        </FormControl>
      </Box>
    </chakra.main>
  );
};

import type { ReactElement } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  ListItem,
  OrderedList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useGameState } from "../contexts/GameStateContext/index.ts";
import { Label } from "./Label.tsx";
import { Characters } from "./CharacterCard.tsx";
import { CharacterBadge } from "./CharacterBadge.tsx";

const FormattedLogMessage = ({ message }: { message: string }): ReactElement => {
  const foundCharacterStartIndex = (() => {
    for (const character of Characters) {
      const characterIndex = message.indexOf(`%${character}%`);
      if (characterIndex !== -1) {
        return characterIndex;
      }
    }

    return -1;
  })();

  if (foundCharacterStartIndex === -1) {
    return <Text as="span" fontSize="lg">{message}</Text>;
  }

  const foundCharacterEndIndex = message.substring(foundCharacterStartIndex + 1).indexOf("%") + 1;
  const characterSpecialString = message.substring(
    foundCharacterStartIndex,
    foundCharacterStartIndex + foundCharacterEndIndex + 1,
  );

  const bits = message.split(characterSpecialString);
  const characterName = characterSpecialString.replaceAll("%", "");

  return (
    <>
      <FormattedLogMessage message={bits[0]} />
      <CharacterBadge character={characterName} />
      <FormattedLogMessage message={bits[1]} />
    </>
  );
};

export const RoundLog = (): ReactElement | null => {
  const { roundLog } = useGameState();
  const { isOpen, onClose, getButtonProps, getDisclosureProps } = useDisclosure();

  const lastMove = roundLog.at(-1);

  if (lastMove) {
    return (
      <>
        <Button
          {...getButtonProps()}
          variant="ghost"
          colorScheme="orange"
          width="fit-content"
          padding="2"
          whiteSpace="normal"
          height="auto"
          lineHeight="7"
        >
          {lastMove.replaceAll("%", "")}
        </Button>

        <Drawer
          isOpen={isOpen}
          onClose={onClose}
          placement="right"
          {...getDisclosureProps()}
        >
          <DrawerContent backgroundColor="main.lightPurple">
            <DrawerCloseButton right="auto" left="3" />
            <DrawerHeader paddingBottom="3">
              <Label>Round Log</Label>
            </DrawerHeader>
            {/* The most recent move should show at the top of the list */}
            <DrawerBody overflow="auto" paddingTop="4">
              <OrderedList reversed spacing={3}>
                {roundLog.toReversed().map((logMsg) => (
                  <ListItem key={logMsg}>
                    <FormattedLogMessage message={logMsg} />
                  </ListItem>
                ))}
              </OrderedList>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return null;
};

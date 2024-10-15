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
          padding="4"
          whiteSpace="normal"
          height="auto"
        >
          <Text as="pre" fontFamily="body">
            {lastMove}
          </Text>
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
                    <Text fontSize="lg">{logMsg}</Text>
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

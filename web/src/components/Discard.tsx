import type { ReactElement } from "react";
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  useDisclosure,
} from "@chakra-ui/react";
import { useGameState } from "../contexts/GameStateContext/index.ts";
import { Label } from "./Label.tsx";
import { CharacterCard } from "./CharacterCard.tsx";

export const Discard = (): ReactElement => {
  const { discard } = useGameState();
  const { isOpen, onClose, getButtonProps, getDisclosureProps } = useDisclosure();

  return (
    <>
      <Box display="flex" flexDirection="column" gap="1">
        <Label>Discard</Label>
        <CharacterCard
          button
          title="Show discard pile."
          character={discard[0]}
          {...getButtonProps()}
        />
      </Box>

      <Drawer isOpen={isOpen} onClose={onClose} placement="right" closeOnOverlayClick={false} {...getDisclosureProps()}>
        <DrawerContent backgroundColor="main.lightPurple">
          <DrawerCloseButton right="auto" left="3" />
          <DrawerHeader paddingBottom="3">
            <Label>Discard Pile</Label>
            <Label>Top</Label>
          </DrawerHeader>
          {/* The most recently played card should show at the top of the list */}
          <DrawerBody
            display="flex"
            flexDirection="column"
            gap="3"
            alignItems="center"
            overflow="auto"
          >
            {discard.map((character, index) => <CharacterCard key={index} character={character} />)}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

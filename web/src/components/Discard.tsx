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

  /**
   * We don't want to show which card was set aside from the deck when a game starts.
   *
   * Discard pile is reversed when sent from the backend so the most recent discard
   * is on the bottom (last index). Reverse the order so that the top card is the most
   * recently played. Makes it easier when displaying the discard pile
   */
  const discardWitHidden = [null, ...discard.slice(1)].reverse();

  return (
    <>
      <Box display="flex" flexDirection="column" gap="1">
        <Label>Discard</Label>
        <Box as="button" {...getButtonProps()} title="Show discard pile." position="relative">
          {discardWitHidden.length > 1
            ? (
              <CharacterCard
                character={discardWitHidden[0]}
                position="absolute"
                boxShadow="-6px -6px 30px 0px rgba(0,0,0,0.3)"
                marginTop="1"
                marginLeft="1"
              />
            )
            : null}
          <CharacterCard
            character={discardWitHidden[0]}
          />
        </Box>
      </Box>

      <Drawer isOpen={isOpen} onClose={onClose} placement="right" {...getDisclosureProps()}>
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
            {discardWitHidden.map((character, index) => <CharacterCard key={index} character={character} />)}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

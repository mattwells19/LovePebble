import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, type DrawerProps } from "@chakra-ui/react";
import { CharacterCard } from "./CharacterCard.tsx";
import { Label } from "./Label.tsx";
import type { Card } from "@lovepebble/server";

interface DiscardDrawerProps extends Omit<DrawerProps, "children"> {
  discard: Array<Card | null>;
}

export const DiscardDrawer = (
  { discard, ...drawerProps }: DiscardDrawerProps,
) => {
  return (
    <Drawer {...drawerProps} placement="right" closeOnOverlayClick={false}>
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
  );
};

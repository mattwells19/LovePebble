import {
  Box,
  Heading,
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  Text,
} from "@chakra-ui/react";
import { useAppbarText } from "../contexts/AppbarContext.tsx";
import { GameRules } from "./GameRules.tsx";
import { ReferenceCard } from "./ReferenceCard.tsx";

export const Appbar = () => {
  const appBarText = useAppbarText();
  const showHelpTip = localStorage.getItem("dismissed-helptip");

  return (
    <>
      <Box
        as="header"
        backgroundColor="main.darkPurple"
        paddingY="4"
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap="5"
        position="relative"
      >
        <Heading
          as="h1"
          fontSize={appBarText === "Love Pebble" ? "5xl" : "4xl"}
          fontFamily="Nova Flat"
          transform="translateY(0.25rem)"
        >
          {appBarText}
        </Heading>
        {appBarText !== "Love Pebble"
          ? (
            <Popover defaultIsOpen={!showHelpTip} onClose={() => localStorage.setItem("dismissed-helptip", "true")}>
              <PopoverAnchor>
                <Box position="absolute" right={{ base: "3", lg: "6" }} display="flex" gap="2">
                  <ReferenceCard />
                  <GameRules />
                </Box>
              </PopoverAnchor>
              <PopoverContent backgroundColor="main.lightPurple">
                <PopoverArrow backgroundColor="main.lightPurple" />
                <PopoverBody>
                  <Text>New to the game? Read about the rules and the different characters here!</Text>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )
          : null}
      </Box>
    </>
  );
};

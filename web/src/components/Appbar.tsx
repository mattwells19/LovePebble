import { Box, Heading } from "@chakra-ui/react";
import { useAppbarText } from "../contexts/AppbarContext.tsx";

export const Appbar = () => {
  const appBarText = useAppbarText();

  return (
    <Box as="header" backgroundColor="main.darkPurple" paddingY="4">
      <Heading
        as="h1"
        fontSize="5xl"
        fontFamily="Nova Flat"
        textAlign="center"
        transform="translateY(0.25rem)"
      >
        {appBarText}
      </Heading>
    </Box>
  );
};

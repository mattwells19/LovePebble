import { Box, Heading } from "@chakra-ui/react";
import { useAppbarText } from "../contexts/AppbarContext.tsx";

export const Appbar = () => {
  const appBarText = useAppbarText();

  return (
    <Box
      as="header"
      backgroundColor="main.darkPurple"
      paddingY="4"
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap="5"
    >
      <Box as="span" role="presentation" fontSize="4xl">💕</Box>
      <Heading
        as="h1"
        fontSize="5xl"
        fontFamily="Nova Flat"
        transform="translateY(0.25rem)"
      >
        {appBarText}
      </Heading>
      <Box as="span" role="presentation" fontSize="4xl">🪨</Box>
    </Box>
  );
};

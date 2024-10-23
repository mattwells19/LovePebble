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
      <Heading
        as="h1"
        fontSize="4xl"
        fontFamily="Nova Flat"
        transform="translateY(0.25rem)"
      >
        {appBarText}
      </Heading>
    </Box>
  );
};

import { Box, Heading } from "@chakra-ui/react";
import { useAppbarContext } from "../contexts/AppbarContext";

export const Appbar = () => {
  const { appBarText } = useAppbarContext();

  return (
    <Box as="header" backgroundColor="main.darkPurple" paddingY="3">
      <Heading textAlign="center">{appBarText}</Heading>
    </Box>
  );
};

import { Box, Button } from "@chakra-ui/react";
import { ReactElement } from "react";

export const BigSubmitButton = (): ReactElement => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      position="fixed"
      left="0"
      bottom="0"
      width="full"
      padding="4"
      bg="main.lightPurple"
    >
      <Button type="submit" size="lg" textTransform="uppercase" width="xs">
        Ok
      </Button>
    </Box>
  );
};

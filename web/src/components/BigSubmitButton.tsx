import type { PropsWithChildren, ReactElement } from "react";
import { Box, Button } from "@chakra-ui/react";

export const BigSubmitButton = ({ children = "Ok" }: PropsWithChildren): ReactElement => {
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
        {children}
      </Button>
    </Box>
  );
};

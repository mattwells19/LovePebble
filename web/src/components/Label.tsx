import { FC } from "react";
import { Text, TextProps } from "@chakra-ui/react";

export const Label: FC<TextProps> = ({ children, ...rest }) => {
  return (
    <Text color="main.greyText" fontSize="small" fontWeight="bold" textTransform="uppercase" align="center" {...rest}>
      {children}
    </Text>
  );
};

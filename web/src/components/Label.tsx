import { ReactElement } from "react";
import { Text, TextProps } from "@chakra-ui/react";

export const Label = ({ children, ...rest }: TextProps): ReactElement => {
  return (
    <Text color="main.greyText" fontSize="small" fontWeight="bold" textTransform="uppercase" align="center" {...rest}>
      {children}
    </Text>
  );
};

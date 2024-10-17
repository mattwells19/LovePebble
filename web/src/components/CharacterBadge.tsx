import type { ReactElement } from "react";
import { Badge, type BadgeProps } from "@chakra-ui/react";

export const CharacterBadge = ({ character, ...props }: { character: string } & BadgeProps): ReactElement => {
  return <Badge backgroundColor={`var(--${character.toLowerCase()})`} variant="solid" {...props}>{character}</Badge>;
};

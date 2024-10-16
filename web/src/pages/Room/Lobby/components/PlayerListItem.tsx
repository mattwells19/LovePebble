import {
  ButtonGroup,
  type ComponentWithAs,
  IconButton,
  type IconButtonProps,
  ListItem,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { RiArrowDownFill, RiArrowUpFill, RiPencilFill } from "@remixicon/react";

const PlayerOptionIconButton: ComponentWithAs<"button", IconButtonProps> = (props) => {
  return (
    <Tooltip label={props["aria-label"]}>
      <IconButton
        colorScheme="gray"
        inset="0"
        left="auto"
        variant="ghost"
        borderRadius="md"
        minWidth="auto"
        width="30px"
        height="30px"
        {...props}
      />
    </Tooltip>
  );
};

interface PlayerListItemProps {
  roomCode: string;
  isCurrentPlayer: boolean;
  isSpectator?: boolean;
  canSwitchRole?: boolean;
  onSwitchRole: () => void;
}

export const PlayerListItem = (
  { roomCode, children, canSwitchRole, onSwitchRole, isCurrentPlayer, isSpectator }: PropsWithChildren<
    PlayerListItemProps
  >,
) => {
  return (
    <ListItem
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      height="40px"
    >
      {isCurrentPlayer
        ? (
          <>
            <Text fontWeight="bold">{children}</Text>
            <ButtonGroup>
              {isSpectator
                ? (
                  <PlayerOptionIconButton
                    aria-label="Become player"
                    icon={<RiArrowUpFill size="20px" />}
                    disabled={!canSwitchRole}
                    onClick={onSwitchRole}
                  />
                )
                : (
                  <PlayerOptionIconButton
                    aria-label="Become spectator"
                    icon={<RiArrowDownFill size="20px" />}
                    disabled={!canSwitchRole}
                    onClick={onSwitchRole}
                  />
                )}
              <PlayerOptionIconButton
                aria-label="Edit name."
                as={Link}
                to={`/name?roomCode=${roomCode}`}
                icon={<RiPencilFill size="20px" />}
              />
            </ButtonGroup>
          </>
        )
        : <Text>{children}</Text>}
    </ListItem>
  );
};

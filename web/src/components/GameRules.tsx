import { type ReactElement, useRef } from "react";
import {
  Button,
  chakra,
  CloseButton,
  Divider,
  Heading,
  IconButton,
  ListItem,
  Table,
  Tbody,
  Td,
  Th,
  Tr,
  UnorderedList,
} from "@chakra-ui/react";
import { RiQuestionMark } from "@remixicon/react";
import { css } from "@emotion/react";

const listCss = css`
  font-size: var(--chakra-fontSizes-lg);
`;

export const GameRules = (): ReactElement => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement, MouseEvent>) => {
    const dialogDimensions = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      dialogRef.current?.close();
    }
  };

  return (
    <>
      <IconButton
        aria-label="The rules"
        icon={<RiQuestionMark />}
        onClick={() => dialogRef.current?.showModal()}
        variant="outline"
        position="absolute"
        bottom="6"
        left="6"
        borderRadius="full"
      />
      <chakra.dialog
        ref={dialogRef}
        onClick={handleDialogClick}
        backgroundColor="main.lightPurple"
        width="sm"
        maxHeight="xl"
      >
        <chakra.div display="flex" justifyContent="space-between">
          <Heading as="h1">Da' Rules</Heading>
          <CloseButton onClick={() => dialogRef.current?.close()} />
        </chakra.div>
        <Divider marginTop="2" marginBottom="4" />
        <chakra.ul display="flex" flexDir="column" gap="4" listStyleType="none" css={listCss}>
          <chakra.li>
            <Heading as="h2" fontSize="2xl" marginBottom="1">Setup</Heading>
            <UnorderedList display="flex" flexDir="column" gap="1">
              <ListItem>
                The 21 character cards are shuffled to create the deck. One card is set aside, facedown. If it's a 2
                player game, 3 more cards are set aside faceup.
              </ListItem>
              <ListItem>Each player is then dealt one card.</ListItem>
            </UnorderedList>
          </chakra.li>
          <chakra.li>
            <Heading as="h2" fontSize="2xl" marginBottom="1">Taking your turn</Heading>
            <UnorderedList display="flex" flexDir="column" gap="1">
              <ListItem>
                On your turn you will be issued a card from the deck, so that you have two cards in your hand.
              </ListItem>
              <ListItem>
                You will choose one of those two cards to perform their action. This is placed faceup in the discard for
                all to see.
              </ListItem>
            </UnorderedList>
          </chakra.li>
          <chakra.li>
            <Heading as="h2" fontSize="2xl" marginBottom="1">End of a Round</Heading>
            <UnorderedList display="flex" flexDir="column" gap="1">
              <ListItem>
                The game is played over several rounds as you elicit the help of the friends and family of the Princess
                to deliver your pebble of love to her.
              </ListItem>
              <ListItem>
                The round is over when there is only one player still in the round or the deck runs out of cards.
              </ListItem>
              <ListItem>
                After a turn, if the deck is empty, all players still in the round reveal their cards. Whoever has the
                highest valued card wins the round and receives a favor pebble.
              </ListItem>
              <ListItem>
                If there is a tie for highest valued card, each of those players are awarded a favor pebble.
              </ListItem>
              <ListItem>
                If there is only one player remaining in the round, the round is over and that player receives a favor
                pebble.
              </ListItem>
              <ListItem>
                The next round is started by resetting back to the original state with the winner of the last round
                going first.
              </ListItem>
            </UnorderedList>
          </chakra.li>
          <chakra.li>
            <Heading as="h2" fontSize="2xl" marginBottom="1">Winning the Game</Heading>
            <UnorderedList display="flex" flexDir="column" gap="1">
              <ListItem>
                The game ends when a player has enough favor pebbles (varying based on the number of players).
              </ListItem>
              <ListItem listStyleType="none">
                <Table size="sm" borderColor="orange.200">
                  <Tbody>
                    <Tr>
                      <Th scope="row">Players</Th>
                      <Td>2</Td>
                      <Td>3</Td>
                      <Td>4</Td>
                      <Td>5</Td>
                      <Td>6</Td>
                    </Tr>
                    <Tr>
                      <Th scope="row">Pebbles</Th>
                      <Td>6</Td>
                      <Td>5</Td>
                      <Td>4</Td>
                      <Td>3</Td>
                      <Td>3</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </ListItem>
            </UnorderedList>
          </chakra.li>
        </chakra.ul>
      </chakra.dialog>
    </>
  );
};

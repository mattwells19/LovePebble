import { type ReactElement, useRef } from "react";
import { chakra, CloseButton, Divider, Heading, IconButton, ListItem, Tooltip, UnorderedList } from "@chakra-ui/react";
import { RiBookletFill } from "@remixicon/react";
import { css } from "@emotion/react";

const tableCss = css`
  margin-top: 8px;

  th, td {
    padding: 4px 16px;
    border: 1px solid var(--chakra-colors-main-greyAccent);
  }
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
      <Tooltip label="Da' Rules">
        <IconButton
          aria-label="The rules"
          icon={<RiBookletFill size="20" />}
          onClick={() => dialogRef.current?.showModal()}
          variant="outline"
          colorScheme="gray"
        />
      </Tooltip>
      <chakra.dialog
        ref={dialogRef}
        onClick={handleDialogClick}
        backgroundColor="main.lightPurple"
        maxWidth={{ base: "90%", lg: "container.md" }}
      >
        <chakra.div display="flex" justifyContent="space-between">
          <Heading as="h1">Da' Rules</Heading>
          <CloseButton onClick={() => dialogRef.current?.close()} />
        </chakra.div>
        <Divider marginTop="2" />
        <chakra.ul
          display="flex"
          flexDir="column"
          gap={{ base: "6", lg: "8" }}
          paddingX="4"
          paddingY="6"
          listStyleType="none"
        >
          <chakra.li>
            <Heading as="h2" fontSize="2xl" marginBottom="1">Setup</Heading>
            <UnorderedList display="flex" flexDir="column" gap="1">
              <ListItem fontSize={{ base: "md", lg: "lg" }}>
                The 21 character cards are shuffled to create the deck. One card is set aside, facedown. If it's a 2
                player game, 3 more cards are set aside faceup.
              </ListItem>
              <ListItem fontSize={{ base: "md", lg: "lg" }}>Each player is then dealt one card.</ListItem>
            </UnorderedList>
          </chakra.li>
          <chakra.li>
            <Heading as="h2" fontSize="2xl" marginBottom="1">Taking your turn</Heading>
            <UnorderedList display="flex" flexDir="column" gap="1">
              <ListItem fontSize={{ base: "md", lg: "lg" }}>
                On your turn you will be issued a card from the deck, so that you have two cards in your hand.
              </ListItem>
              <ListItem fontSize={{ base: "md", lg: "lg" }}>
                You will choose one of those two cards to perform their action. This is placed faceup in the discard for
                all to see.
              </ListItem>
            </UnorderedList>
          </chakra.li>
          <chakra.li>
            <Heading as="h2" fontSize="2xl" marginBottom="1">End of a Round</Heading>
            <UnorderedList display="flex" flexDir="column" gap="1">
              <ListItem fontSize={{ base: "md", lg: "lg" }}>
                The game is played over several rounds as you elicit the help of the friends and family of the Princess
                to deliver your pebble of love to her.
              </ListItem>
              <ListItem fontSize={{ base: "md", lg: "lg" }}>
                The round is over when there is only one player still in the round or the deck runs out of cards.
              </ListItem>
              <ListItem fontSize={{ base: "md", lg: "lg" }}>
                After a turn, if the deck is empty, all players still in the round reveal their cards. Whoever has the
                highest valued card wins the round and receives a favor pebble.
              </ListItem>
              <ListItem fontSize={{ base: "md", lg: "lg" }}>
                If there is a tie for highest valued card, each of those players are awarded a favor pebble.
              </ListItem>
              <ListItem fontSize={{ base: "md", lg: "lg" }}>
                If there is only one player remaining in the round, the round is over and that player receives a favor
                pebble.
              </ListItem>
              <ListItem fontSize={{ base: "md", lg: "lg" }}>
                The next round is started by resetting back to the original state with the winner of the last round
                going first.
              </ListItem>
            </UnorderedList>
          </chakra.li>
          <chakra.li>
            <Heading as="h2" fontSize="2xl" marginBottom="1">Winning the Game</Heading>
            <UnorderedList display="flex" flexDir="column" gap="1">
              <ListItem fontSize={{ base: "md", lg: "lg" }}>
                The game ends when a player has enough favor pebbles (varying based on the number of players).
              </ListItem>
              <ListItem listStyleType="none" marginLeft="-1em">
                <chakra.table css={tableCss.styles}>
                  <tbody>
                    <tr>
                      <th scope="row">Players</th>
                      <td>2</td>
                      <td>3</td>
                      <td>4</td>
                      <td>5</td>
                      <td>6</td>
                    </tr>
                    <tr>
                      <th scope="row">Pebbles</th>
                      <td>6</td>
                      <td>5</td>
                      <td>4</td>
                      <td>3</td>
                      <td>3</td>
                    </tr>
                  </tbody>
                </chakra.table>
              </ListItem>
            </UnorderedList>
          </chakra.li>
        </chakra.ul>
      </chakra.dialog>
    </>
  );
};

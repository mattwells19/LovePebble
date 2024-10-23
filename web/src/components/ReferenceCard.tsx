import { type ReactElement, useRef } from "react";
import { Box, chakra, CloseButton, Divider, Heading, IconButton, Text, Tooltip } from "@chakra-ui/react";
import { RiGroupFill } from "@remixicon/react";
import { CharacterDescriptions, Characters } from "./CharacterCard.tsx";

const characterDetails = [
  { color: "var(--spy)", count: 2 },
  { color: "var(--guard)", count: 6 },
  { color: "var(--priest)", count: 2 },
  { color: "var(--baron)", count: 2 },
  { color: "var(--handmaid)", count: 2 },
  { color: "var(--prince)", count: 2 },
  { color: "var(--chancellor)", count: 2 },
  { color: "var(--king)", count: 1 },
  { color: "var(--countess)", count: 1 },
  { color: "var(--princess)", count: 1 },
];

export const ReferenceCard = (): ReactElement => {
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
      <Tooltip label="Character Reference">
        <IconButton
          aria-label="Character Reference"
          icon={<RiGroupFill size="20" />}
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
          <Heading as="h1" fontSize="2xl">Characters</Heading>
          <CloseButton onClick={() => dialogRef.current?.close()} />
        </chakra.div>
        <Divider marginTop="2" />
        <chakra.ul>
          {Characters.map((character, value) => {
            const { color, count } = characterDetails[value];

            return (
              <chakra.li
                key={character}
                display="flex"
                gap="3"
                paddingY={{ base: "2", lg: "3" }}
                color="whiteAlpha.900"
                borderBottom="1px"
                borderColor="main.greyAccent"
              >
                <Box
                  display="grid"
                  placeItems="center"
                  backgroundColor={color}
                  borderRadius="md"
                  width="30px"
                  height="30px"
                  alignSelf="start"
                  marginTop="0.5"
                >
                  <Text as="span" fontSize={{ base: "md", lg: "lg" }} fontWeight="bold">
                    {value}
                  </Text>
                </Box>
                <Box fontSize={{ base: "sm", lg: "md" }}>
                  <Text as="p" fontWeight="bold">
                    {character} <Text as="span" fontWeight="normal">(x{count})</Text>
                  </Text>
                  <Text as="p" marginTop="0.5">
                    {CharacterDescriptions[value]}
                  </Text>
                </Box>
              </chakra.li>
            );
          })}
        </chakra.ul>
      </chakra.dialog>
    </>
  );
};

import { Box, Heading, Table, TableCaption, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { SocketIncoming } from "@lovepebble/server";
import { useGameState } from "../../contexts/GameStateContext/index.ts";
import { BigSubmitButton } from "../../components/BigSubmitButton.tsx";

const getWinCount = (playerCount: number): number => {
  switch (playerCount) {
    case 2:
      return 6;
    case 3:
      return 5;
    case 4:
      return 4;
    case 5:
    case 6:
      return 3;
    default:
      return -1;
  }
};

export const RoundEnd = () => {
  const { players, sendGameUpdate, roundLog } = useGameState();
  const pebblesNeededToWin = getWinCount(players.size);

  const gameWinningPlayer = Array.from(players.values()).find((player) => player.gameScore === pebblesNeededToWin);

  const handleAction = () => {
    if (gameWinningPlayer) {
      sendGameUpdate({ type: SocketIncoming.ResetGame });
    } else {
      sendGameUpdate({ type: SocketIncoming.StartRound });
    }
  };

  const lastMove = roundLog.at(-1);

  return (
    <>
      <Box as="form" action={handleAction} display="flex" flexDir="column" gap="10" minWidth="xs">
        {gameWinningPlayer ? <Heading as="h2">{gameWinningPlayer.name} Wins!</Heading> : null}
        {lastMove ? <Heading as="h2">{lastMove}</Heading> : null}
        <TableContainer>
          <Table>
            <TableCaption>First to {pebblesNeededToWin} wins!</TableCaption>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Wins</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Array.from(players).map(([playerId, player]) => (
                <Tr key={playerId}>
                  <Td>{player.name}</Td>
                  <Td>
                    {Array.from({ length: player.gameScore }).map(() => (
                      <span>
                        🪨&nbsp;
                      </span>
                    ))}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <BigSubmitButton>
          {gameWinningPlayer ? "Back to Lobby" : "Next Round"}
        </BigSubmitButton>
      </Box>
    </>
  );
};

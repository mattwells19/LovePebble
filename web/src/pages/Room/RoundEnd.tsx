import { Box, Heading, Table, TableCaption, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { SocketIncoming } from "@lovepebble/server";
import { useGameState } from "../../contexts/GameStateContext/index.ts";
import { BigSubmitButton } from "../../components/BigSubmitButton.tsx";
import { RoundLog } from "../../components/RoundLog.tsx";

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
  const { players, sendGameUpdate } = useGameState();
  const pebblesNeededToWin = getWinCount(players.size);

  const gameWinningPlayers = Array.from(players.values()).filter((player) => player.gameScore >= pebblesNeededToWin);

  const handleAction = () => {
    if (gameWinningPlayers.length > 0) {
      sendGameUpdate({ type: SocketIncoming.ResetGame });
    } else {
      sendGameUpdate({ type: SocketIncoming.StartRound });
    }
  };

  const winnerDeclaration: string | null = (() => {
    if (gameWinningPlayers.length === 0) return null;

    if (gameWinningPlayers.length === 1) return `${gameWinningPlayers[0].name} Wins!`;

    const winningPlayerNames = gameWinningPlayers.slice(0, -1).map((p) => p.name).join(", ");
    const lastWinningPlayerName = gameWinningPlayers.at(-1)!.name;

    return `${winningPlayerNames} and ${lastWinningPlayerName} Win!`;
  })();

  return (
    <>
      <Box as="form" action={handleAction} display="flex" flexDir="column" gap="10" minWidth="xs">
        {winnerDeclaration
          ? (
            <Heading as="h2" textAlign="center">
              Game over!<br />
              {winnerDeclaration} 🥳
            </Heading>
          )
          : null}
        <RoundLog />
        <TableContainer>
          <Table>
            <TableCaption>First to {pebblesNeededToWin} pebbles wins!</TableCaption>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Wins</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Array.from(players).map(([playerId, player]) => (
                <Tr key={playerId}>
                  <Td>{`${player.name} ${player.gameScore >= pebblesNeededToWin ? "🏆" : ""}`}</Td>
                  <Td title={`${player.gameScore} pebbles`}>
                    {Array.from({ length: player.gameScore }).fill("🪨").join(" ")}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <BigSubmitButton>
          {gameWinningPlayers.length > 0 ? "Back to Lobby" : "Next Round"}
        </BigSubmitButton>
      </Box>
    </>
  );
};

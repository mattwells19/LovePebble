import { useEffect, useState } from "react";
import { Box, IconButton } from "@chakra-ui/react";
import type { PlayerId } from "@lovepebble/server";
import { RiArrowLeftFill, RiArrowRightFill } from "@remixicon/react";
import { useGameState } from "../../../../contexts/GameStateContext/index.ts";
import { Label } from "../../../../components/Label.tsx";
import { ActionSelect } from "../../../../components/ActionSelection.tsx";
import { CharacterCard } from "../../../../components/CharacterCard.tsx";

export const SpectatorView = () => {
  const { round, players } = useGameState();

  if (!round) {
    throw new Error("No round state on the game screen.");
  }

  const [spectatingPlayerId, setSpectatingPlayerId] = useState<PlayerId>(round.playerTurnId);
  const spectatingPlayer = players.get(spectatingPlayerId);
  const allPlayerIds = Array.from(players.keys());

  useEffect(() => {
    if (!players.has(spectatingPlayerId)) {
      setSpectatingPlayerId(round.playerTurnId);
    }
  }, [players, spectatingPlayerId]);

  if (!spectatingPlayer) return null;

  const currentSpectatingIndex = allPlayerIds.indexOf(spectatingPlayerId);
  const handlePreviousPlayer = () => {
    if (currentSpectatingIndex === 0) {
      setSpectatingPlayerId(allPlayerIds.at(-1)!);
    } else {
      setSpectatingPlayerId(allPlayerIds[currentSpectatingIndex - 1]);
    }
  };

  const handleNextPlayer = () => {
    if (currentSpectatingIndex === allPlayerIds.length - 1) {
      setSpectatingPlayerId(allPlayerIds[0]);
    } else {
      setSpectatingPlayerId(allPlayerIds[currentSpectatingIndex + 1]);
    }
  };

  return (
    <Box
      width="full"
      display="flex"
      flexDir="column"
      gap="inherit"
      paddingBottom="20"
    >
      <Box position="relative">
        <IconButton
          aria-label="View previous player."
          icon={<RiArrowLeftFill />}
          colorScheme="gray"
          variant="ghost"
          onClick={handlePreviousPlayer}
          position="absolute"
          inset={0}
          width="fit-content"
          margin="auto auto auto 0"
        />
        <IconButton
          aria-label="View next player."
          icon={<RiArrowRightFill />}
          colorScheme="gray"
          variant="ghost"
          onClick={handleNextPlayer}
          position="absolute"
          inset={0}
          width="fit-content"
          margin="auto 0px auto auto"
        />
        {spectatingPlayer.cards.length > 0
          ? (
            <Box display="flex" flexDirection="column" gap="1">
              <Label>
                [Spectator Mode]<br />
                {`${spectatingPlayer.name}'s cards`}
              </Label>
              <Box display="flex" gap="3" margin="auto">
                {spectatingPlayer.cards.map((card) => <CharacterCard key={card} character={card} />)}
              </Box>
            </Box>
          )
          : <Label>{`${spectatingPlayer.name} is out of this round.`}</Label>}
      </Box>
      <ActionSelect
        playerCards={spectatingPlayer.cards}
      />
    </Box>
  );
};

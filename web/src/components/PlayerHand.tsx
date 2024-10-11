import type { ReactElement } from "react";
import { Box } from "@chakra-ui/react";
import type { Card } from "@lovepebble/server";
import { CharacterCard } from "./CharacterCard.tsx";
import { CardSelection } from "./CardSelection.tsx";
import { Label } from "./Label.tsx";

interface PlayerHandProps {
  isPlayersTurn: boolean;
  playerCards: Array<Card>;
  hasPlayedCard: boolean;
}

const PlayerHand = ({ isPlayersTurn, hasPlayedCard, playerCards }: PlayerHandProps): ReactElement => {
  return (
    <Box display="flex" flexDirection="column" gap="1">
      <Label>Your cards</Label>
      <Box display="flex" gap="3" margin="auto">
        {isPlayersTurn && !hasPlayedCard ? <CardSelection cardOptions={playerCards} htmlName="card-to-play" /> : (
          playerCards.map((card) => <CharacterCard key={card} character={card} />)
        )}
      </Box>
    </Box>
  );
};

export default PlayerHand;

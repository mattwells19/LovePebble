import { useGameState } from "../contexts/GameStateContext";
import { Text } from "@chakra-ui/react";

export const Game = () => {
  const { deckCount, currentPlayerId, gameState, players } = useGameState();

  if (!gameState) throw new Error("No game state on the game screen.");

  return (
    <>
      <Text>
        {gameState.playerTurnId === currentPlayerId
          ? "It's your turn!"
          : `It's ${players.get(currentPlayerId)?.name}'s turn.`}
      </Text>
      <Text>Deck Count: {deckCount}</Text>
      <div>
        {players.get(currentPlayerId)?.cards.map((card, index) => (
          <Text key={index}>{card}</Text>
        ))}
      </div>
    </>
  );
};

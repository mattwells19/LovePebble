import type { Card } from "../../types/types.ts";

export const Characters = [
  "%Spy%",
  "%Guard%",
  "%Priest%",
  "%Baron%",
  "%Handmaid%",
  "%Prince%",
  "%Chancellor%",
  "%King%",
  "%Countess%",
  "%Princess%",
] as const;

export const LOG_MESSAGES = {
  join: {
    player: (name: string) => `${name} joined the room.`,
    spectator: (name: string) => `${name} joined the room as a spectator.`,
  },
  leave: (name: string) => `${name} left the room.`,
  startRound: "Round started!",
  spy: (name: string) => `Sneaky sneaky! ${name} played the %Spy%!`,
  guard: {
    guessedCorrect: (guesser: string, guessing: string, card: Card) =>
      `${guesser} played the %Guard%, guessed that ${guessing} had a ${
        Characters[card]
      } and was correct! ${guessing} is out of the round.`,
    guessedWrong: (guesser: string, guessing: string, card: Card) =>
      `${guesser} played the %Guard%, guessed that ${guessing} had a ${Characters[card]} and was incorrect.`,
    noEffect: (name: string) =>
      `${name} played the %Guard%, but there were no players to select so the card has no effect.`,
  },
  priest: {
    peak: (peaker: string, peakingAt: string) =>
      `${peaker} played the %Priest% and decided to look at ${peakingAt}'s card.`,
    noEffect: (name: string) =>
      `${name} played the %Priest%, but there were no players to select so the card has no effect.`,
  },
  baron: {
    challenging: (challenger: string, challenged: string, result: "win" | "loss" | "tie") => {
      const base = `${challenger} played the %Baron% and challenged ${challenged}.`;

      const resultText = (() => {
        if (result === "win") {
          return `${challenger} wins the challenge! ${challenged} is out of the round.`;
        } else if (result === "loss") {
          return `${challenger} lost the challenge and is out of the round.`;
        } else {
          return "The result is a tie! Both players remain in the round.";
        }
      })();

      return `${base} ${resultText}`;
    },
    noEffect: (name: string) =>
      `${name} played the %Baron%, but there were no players to challenge so the card has no effect.`,
  },
  handmaid: (name: string) => `${name} played the %Handmaid%. Hands off!`,
  prince: {
    discardPrincess: (chooser: string, chosen: string) =>
      `${chooser} played the %Prince%, and made ${chosen} discard their %Princess%! ${chosen} is out of the round.`,
    discardThemself: (name: string, card: Card) =>
      `${name} played the %Prince%, and decided to discard their ${Characters[card]}.`,
    discardOther: (chooser: string, chosen: string, card: Card) =>
      `${chooser} played the %Prince%, and made ${chosen} discard their ${Characters[card]}.`,
    noEffect: (name: string) =>
      `${name} played the %Prince%, but there were no players to choose so the card has no effect.`,
  },
  chancellor: {
    exchange: (name: string) => `${name} played the %Chancellor%.`,
    noEffect: (name: string) => `${name} played the %Chancellor%. The deck was empty so there is no effect.`,
  },
  king: {
    swapped: (swapper: string, swappedWith: string) =>
      `${swapper} played the %King% and swapped cards with ${swappedWith}.`,
    noEffect: (name: string) =>
      `${name} played the %King%, but there were no players to select so the card has no effect.`,
  },
  countess: (name: string) => `Oooooo, ${name} played the %Countess%!`,
  princess: (name: string) => `${name}... *checks notes* played the %Princess%? So I guess they're out of the round.`,
  gameOver: (winningPlayers: Array<string>, spyWinner: string | undefined) => {
    const winnersMsg = (() => {
      if (winningPlayers.length > 1) {
        return `${winningPlayers.join(", ")} all get pebbles for winning the round!`;
      } else {
        return `${winningPlayers[0]} gets a pebble for winning the round!`;
      }
    })();

    const spyMsg = (() => {
      if (spyWinner) {
        return ` ${spyWinner} gets a pebble for being the last %Spy% standing!`;
      } else {
        return "";
      }
    })();

    return `${winnersMsg}\n\n${spyMsg}`;
  },
} as const;

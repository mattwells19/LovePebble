export const enum Card {
  Spy = 0,
  Guard,
  Priest,
  Baron,
  Handmaid,
  Prince,
  Chancellor,
  King,
  Countess,
  Princess,
}

export const StandardDeck: ReadonlyArray<Card> = [
  ...Array(2).fill(Card.Spy),
  ...Array(6).fill(Card.Guard),
  ...Array(2).fill(Card.Priest),
  ...Array(2).fill(Card.Baron),
  ...Array(2).fill(Card.Handmaid),
  ...Array(2).fill(Card.Prince),
  ...Array(2).fill(Card.Chancellor),
  ...Array(1).fill(Card.King),
  ...Array(1).fill(Card.Countess),
  ...Array(1).fill(Card.Princess),
];

export type PlayerId = Readonly<string>;

export interface Player {
  name: string;
  cards: Array<Card>;
  handmaidProtected: boolean;
  playedSpy: boolean;
  outOfRound: boolean;
  gameScore: number;
}

export type SimplePlayerSelect = {
  chosenPlayerId: PlayerId | null;
};

export type PlayedSpy = { cardPlayed: Card.Spy; details: null };

export type PlayedGuard = {
  cardPlayed: Card.Guard;
  details: {
    chosenPlayerId: PlayerId | null;
    card: Card | null;
  };
};

export type PlayedPriest = {
  cardPlayed: Card.Priest;
  details: SimplePlayerSelect & { submitted: boolean };
};

export type PlayedBaron = {
  cardPlayed: Card.Baron;
  details: {
    chosenPlayerId: PlayerId | null;
    winningPlayerId: PlayerId | null;
    submitted: boolean;
  };
};

export type PlayedHandmaid = {
  cardPlayed: Card.Handmaid;
  details: null;
};

export type PlayedPrince = {
  cardPlayed: Card.Prince;
  details: SimplePlayerSelect;
};

export type PlayedChancellor = {
  cardPlayed: Card.Chancellor;
  // if there are no cards in the deck to choose from playing this card has no effect
  details: {
    deckOptions: Array<Card>;
    card: Card | null;
    submitted: boolean;
  } | null;
};

export type PlayedKing = {
  cardPlayed: Card.King;
  details: SimplePlayerSelect;
};

export type PlayedCountess = {
  cardPlayed: Card.Countess;
  details: null;
};

export type PlayedPrincess = {
  cardPlayed: Card.Princess;
  details: null;
};

export type WaitingForChoice = {
  cardPlayed: null;
  details: null;
};

export type GameNotStarted = { started: false; playerTurnId: null };

export type GameStarted = {
  started: true;
  playerTurnId: PlayerId;
};

export type GameData =
  & GameStarted
  & (
    | PlayedSpy
    | PlayedGuard
    | PlayedPriest
    | PlayedBaron
    | PlayedHandmaid
    | PlayedPrince
    | PlayedChancellor
    | PlayedKing
    | PlayedCountess
    | PlayedPrincess
    | WaitingForChoice
  );

export interface RoomData {
  deck: Array<Card>;
  discard: Array<Card>;
  players: Map<PlayerId, Player>;
  game: GameData;
  gameLog: Array<string>;
}

export interface RoomDataGameNotStarted {
  deck: [];
  discard: [];
  players: Map<PlayerId, Player>;
  game: GameNotStarted;
}

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

export type PlayerId = Readonly<string>;

export interface Player {
  name: string;
  cards: Array<Card>;
  handmaidProtected: boolean;
  outOfRound: boolean;
  gameScore: number;
}

export type SimplePlayerSelect = {
  chosenPlayerId: PlayerId | null;
  submitted: boolean;
};

export type PlayedSpy = { cardPlayed: Card.Spy; details: null };

export type PlayedGuard = {
  cardPlayed: Card.Guard;
  details: {
    chosenPlayerId: PlayerId | null;
    card: Card;
    submitted: boolean;
  };
};

export type PlayedPriest = {
  cardPlayed: Card.Priest;
  details: SimplePlayerSelect;
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
  details: {
    deckOptions: Array<Card>;
    chosenCard: Card;
  };
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

export type GameStarted = { started: true; playerTurnId: PlayerId; winningSpyPlayerId: PlayerId | null };

export type GameData =
  | GameNotStarted
  | (GameStarted &
      (
        | PlayedSpy
        | PlayedPriest
        | PlayedBaron
        | PlayedHandmaid
        | PlayedPrince
        | PlayedChancellor
        | PlayedKing
        | PlayedCountess
        | PlayedPrincess
        | WaitingForChoice
      ));

export interface RoomData {
  deck: Array<Card>;
  players: Map<PlayerId, Player>;
  game: GameData;
}

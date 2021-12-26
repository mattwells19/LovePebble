const enum Card {
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

type PlayerId = Readonly<string>;

interface Player {
  name: string;
  cards: Array<Card>;
  handmaidProtected: boolean;
  outOfRound: boolean;
  gameScore: number;
}

type SimplePlayerSelect = {
  chosenPlayerId: PlayerId | null;
  submitted: boolean;
};

type PlayedSpy = { cardPlayed: Card.Spy; details: null };

type PlayedGuard = {
  cardPlayed: Card.Guard;
  details: {
    chosenPlayerId: PlayerId | null;
    card: Card;
    submitted: boolean;
  };
};

type PlayedPriest = {
  cardPlayed: Card.Priest;
  details: SimplePlayerSelect;
};

type PlayedBaron = {
  cardPlayed: Card.Baron;
  details: {
    chosenPlayerId: PlayerId | null;
    winningPlayerId: PlayerId | null;
    submitted: boolean;
  };
};

type PlayedHandmaid = {
  cardPlayed: Card.Handmaid;
  details: null;
};

type PlayedPrince = {
  cardPlayed: Card.Prince;
  details: SimplePlayerSelect;
};

type PlayedChancellor = {
  cardPlayed: Card.Chancellor;
  details: {
    deckOptions: Array<Card>;
    chosenCard: Card;
  };
};

type PlayedKing = {
  cardPlayed: Card.King;
  details: SimplePlayerSelect;
};

type PlayedCountess = {
  cardPlayed: Card.Countess;
  details: null;
};

type PlayedPrincess = {
  cardPlayed: Card.Princess;
  details: null;
};

type WaitingForChoice = {
  cardPlayed: null;
  details: null;
};

type GameNotStarted = { started: false; playerTurnId: null };

type GameStarted = { started: true; playerTurnId: PlayerId; winningSpyPlayerId: PlayerId | null };

type GameData =
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

interface RoomData {
  deck: Array<Card>;
  players: Map<PlayerId, Player>;
  game: GameData;
}

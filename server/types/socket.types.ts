import type { Card, Player, PlayerId, RoundData } from "./types.ts";

export const enum SocketIncoming {
  Join = "join",
  StartGame = "startGame",
  StartRound = "startRound",
  PlayCard = "playCard", // when a user chooses a card to play on their turn
  SelectPlayer = "selectPlayer",
  SelectCard = "selectCard", // when user selects a card for an action
  SubmitSelection = "submitSelection",
  AcknowledgeAction = "acknowledgeAction",
  ResetGame = "resetGame",
}

export const enum SocketOutgoing {
  Connected = "connected",
  GameUpdate = "gameUpdate",
}

export interface OutgoingGameStateUpdate {
  gameStarted: boolean;
  deckCount: number;
  discard: Array<Card>;
  players: [PlayerId, Player][];
  round: RoundData | null;
  roundLog: Array<string>;
}

export interface SocketEvent {
  type: SocketIncoming;
}

export interface StartGameEvent extends SocketEvent {
  type: SocketIncoming.StartGame;
}

export interface StartRoundEvent extends SocketEvent {
  type: SocketIncoming.StartRound;
}

export interface JoinEvent extends SocketEvent {
  type: SocketIncoming.Join;
  playerName: string;
}

export interface PlayCardEvent extends SocketEvent {
  type: SocketIncoming.PlayCard;
  cardPlayed: Card;
}

export interface SelectCardEvent extends SocketEvent {
  type: SocketIncoming.SelectCard;
  cardSelected: Card;
}

export interface SelectPlayerEvent extends SocketEvent {
  type: SocketIncoming.SelectPlayer;
  playerSelected: PlayerId;
}

export interface SubmitSelectionEvent extends SocketEvent {
  type: SocketIncoming.SubmitSelection;
}

export interface AcknowledgeActionEvent extends SocketEvent {
  type: SocketIncoming.AcknowledgeAction;
}

export interface ResetGameEvent extends SocketEvent {
  type: SocketIncoming.ResetGame;
}

export type SocketMessage =
  | JoinEvent
  | StartGameEvent
  | StartRoundEvent
  | PlayCardEvent
  | SelectCardEvent
  | SelectPlayerEvent
  | SubmitSelectionEvent
  | AcknowledgeActionEvent
  | ResetGameEvent
  | "PING";

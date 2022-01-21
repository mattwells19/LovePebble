import { Card, GameData, Player, PlayerId } from "./types.ts";

export const enum SocketIncoming {
  Join = "join",
  StartGame = "startGame",
  PlayCard = "playCard", // when a user chooses a card to play on their turn
  SelectPlayer = "selectPlayer",
  SelectCard = "selectCard", // when user selects a card for an action
  SubmitSelection = "submitSelection",
  AcknowledgeAction = "acknowledgeAction",
}

export const enum SocketOutgoing {
  PlayerUpdate = "playersUpdate",
  Connected = "connected",
  GameUpdate = "gameUpdate",
}

export interface OutgoingGameStateUpdate {
  deckCount: number;
  discard: Array<Card | "Hidden">;
  players: [PlayerId, Player][];
  game: GameData;
}

export interface SocketEvent {
  type: SocketIncoming;
}

export interface StartGameEvent extends SocketEvent {
  type: SocketIncoming.StartGame;
}

export interface JoinEvent extends SocketEvent {
  type: SocketIncoming.Join;
  roomCode: string;
  playerName: string;
  oldPlayerId?: string;
}

export interface PlayCardEvent extends SocketEvent {
  type: SocketIncoming.PlayCard;
  cardPlayed: Card;
}

export interface SelectCardEvent extends SocketEvent {
  type: SocketIncoming.SelectCard;
  cardPlayed: Card;
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

export type SocketMessage =
  | JoinEvent
  | StartGameEvent
  | PlayCardEvent
  | SelectCardEvent
  | SelectPlayerEvent
  | SubmitSelectionEvent
  | AcknowledgeActionEvent;

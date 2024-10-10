import type { OutgoingGameStateUpdate, Player, PlayerId, SocketOutgoing } from "@lovepebble/server";

export type SocketMessage =
  | ConnectedEvent
  | PlayerUpdateEvent
  | GameStateUpdate;

export type ConnectedEvent = {
  type: SocketOutgoing.Connected;
  data: PlayerId;
};

export type PlayerUpdateEvent = {
  type: SocketOutgoing.PlayerUpdate;
  data: [PlayerId, Player][];
};

export type GameStateUpdate = {
  type: SocketOutgoing.GameUpdate;
  data: OutgoingGameStateUpdate;
};

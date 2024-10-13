import type { OutgoingGameStateUpdate, PlayerId, SocketOutgoing } from "@lovepebble/server";

export type SocketMessage =
  | ConnectedEvent
  | GameStateUpdate;

export type ConnectedEvent = {
  type: SocketOutgoing.Connected;
  data: {
    userId: PlayerId;
    roomExists: boolean;
  };
};

export type GameStateUpdate = {
  type: SocketOutgoing.GameUpdate;
  data: OutgoingGameStateUpdate;
};

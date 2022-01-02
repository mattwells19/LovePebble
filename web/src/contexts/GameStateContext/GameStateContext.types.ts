import { SocketOutgoing, OutgoingGameStateUpdate } from "../../../../server/types/socket.types";
import { PlayerId, Player } from "../../../../server/types/types";

export type SocketMessage = ConnectedEvent | PlayerUpdateEvent | GameStateUpdate;

export type ConnectedEvent = {
  type: SocketOutgoing.Connected;
  data: PlayerId;
};

export type PlayerUpdateEvent = {
  type: SocketOutgoing.PlayerUpdate;
  data: readonly [string, Player][];
};

export interface GameStateUpdateData extends Omit<OutgoingGameStateUpdate, "players"> {
  players: readonly [string, Player][];
}

export type GameStateUpdate = {
  type: SocketOutgoing.GameUpdate;
  data: GameStateUpdateData;
};

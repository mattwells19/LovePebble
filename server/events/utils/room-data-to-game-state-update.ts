import type { OutgoingGameStateUpdate } from "../../types/socket.types.ts";
import type { RoomData } from "../../types/types.ts";

export const roomDataToGameStateUpdate = (roomData: RoomData): OutgoingGameStateUpdate => ({
  gameStarted: roomData.gameStarted,
  deckCount: roomData.deck.length,
  discard: roomData.discard,
  round: roomData.round,
  players: Array.from(roomData.players),
  spectators: Array.from(roomData.spectators),
  roundLog: roomData.roundLog,
});

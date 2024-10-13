import type { RoomData, RoundData } from "../types/types.ts";

export function validateRoundStarted<TRoundData extends RoundData = RoundData>(roomData: RoomData): TRoundData {
  if (roomData.round === null) {
    throw new Error("Round not started.");
  }
  return roomData.round as TRoundData;
}

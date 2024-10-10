import type { RoomData, RoomDataGameNotStarted } from "../types/types.ts";

export const Rooms = new Map<Readonly<string>, RoomData | RoomDataGameNotStarted>();

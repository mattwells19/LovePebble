import { RoomData, type RoomDataGameNotStarted } from "../types/types.ts";

export const Rooms = new Map<Readonly<string>, RoomData | RoomDataGameNotStarted>();

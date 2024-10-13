import { Rooms } from "../repositories/Rooms.ts";
import { Card, type RoomData } from "../types/types.ts";
import * as cardActions from "./card-actions/mod.ts";

export function submitSelection(roomCode: string, roomData: RoomData): RoomData {
  const newRoomData = (() => {
    switch (roomData.round?.cardPlayed) {
      case Card.Spy:
        return cardActions.playedSpy(roomData);
      case Card.Guard:
        return cardActions.playedGuard(roomData);
      case Card.Priest:
        return cardActions.playedPriest(roomData);
      case Card.Baron:
        return cardActions.playedBaron(roomData);
      case Card.Handmaid:
        return cardActions.playedHandmaid(roomData);
      case Card.Prince:
        return cardActions.playedPrince(roomData);
      case Card.Chancellor:
        return cardActions.playedChancellor(roomData);
      case Card.King:
        return cardActions.playedKing(roomData);
      case Card.Countess:
        return cardActions.playedCountess(roomData);
      case Card.Princess:
        return cardActions.playedPrincess(roomData);
      default:
        throw new Error(`Action not yet implemented for ${roomData.round?.cardPlayed}.`);
    }
  })();

  Rooms.set(roomCode, newRoomData);
  return newRoomData;
}

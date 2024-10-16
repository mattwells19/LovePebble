import type { UserSocket } from "@lovepebble/sockets";
import { Rooms } from "../repositories/Rooms.ts";
import { Sockets } from "../repositories/Sockets.ts";
import { SocketIncoming, type SocketMessage, SocketOutgoing } from "../types/socket.types.ts";
import type { RoomData } from "../types/types.ts";
import { roomDataToGameStateUpdate } from "../events/utils/mod.ts";
import * as eventHandlers from "../events/mod.ts";

function sendMessageToRoom(roomCode: string, updatedRoomData: RoomData) {
  const allUserIds = [
    ...Array.from(updatedRoomData.players.keys()),
    ...Array.from(updatedRoomData.spectators.keys()),
  ];

  const allUserSockets = allUserIds
    .map((allUserIds) => Sockets.get(allUserIds, roomCode));

  const data = { type: SocketOutgoing.GameUpdate, data: roomDataToGameStateUpdate(updatedRoomData) };

  for (const userSocket of allUserSockets) {
    userSocket?.send(data);
  }
}

/**
 * WebSocket.onopen
 */
export const handleOpen = (userSocket: UserSocket) => {
  const roomExists = Rooms.has(userSocket.roomCode);
  userSocket.send({
    type: SocketOutgoing.Connected,
    data: { userId: userSocket.userId, roomExists: roomExists },
  });
};

/**
 * WebSocket.onclose
 */
export const handleClose = (userSocket: UserSocket) => {
  const preSocket = userSocket;
  setTimeout(() => {
    const postSocket = Sockets.get(userSocket.id);

    // same socketId but different socket object means they reconnected
    if (postSocket && preSocket.socket !== postSocket.socket) {
      return;
    }

    const roomCode = userSocket.roomCode;
    const playerLeavingId = userSocket.userId;

    // remove socket from the store
    Sockets.delete(userSocket.id);

    const roomData = Rooms.get(roomCode);
    if (!roomData) return;

    try {
      const updatedRoomData = eventHandlers.leave(roomCode, roomData, playerLeavingId);

      if (updatedRoomData) {
        Rooms.set(roomCode, updatedRoomData);
        sendMessageToRoom(roomCode, updatedRoomData);
      } else {
        Rooms.delete(roomCode);
      }
    } catch (err) {
      console.error("Leave room error", err);
      console.error("Room data", roomData);
    }
    // socket is left alive for 3 seconds to allow user to rejoin
  }, 3000);
};

/**
 * WebSocket.onmessage
 */
export const handleMessage = (
  userSocket: UserSocket,
  data: SocketMessage,
): void => {
  if (data === "PING") {
    return userSocket.send("PONG");
  }

  try {
    const roomCode = userSocket.roomCode;
    const roomData = Rooms.get(roomCode);
    if (!roomData) {
      return;
    }

    switch (data.type) {
      case SocketIncoming.Join: {
        const userAlreadyInRoom = roomData.players.has(userSocket.userId) || roomData.spectators.has(userSocket.userId);
        // if they're already in the room, no need to add them again just send an update
        if (userAlreadyInRoom) {
          userSocket.send({
            type: SocketOutgoing.GameUpdate,
            data: roomDataToGameStateUpdate(roomData),
          });
          break;
        }

        const joinResult = eventHandlers.join(roomCode, roomData, userSocket.userId, data.playerName);
        sendMessageToRoom(roomCode, joinResult);
        break;
      }
      case SocketIncoming.StartGame: {
        if (roomData.gameStarted) break;

        const startGameResult = eventHandlers.startGame(roomCode, roomData);
        sendMessageToRoom(roomCode, startGameResult);
        break;
      }
      case SocketIncoming.StartRound: {
        if (roomData.round) break;

        const startRoundResult = eventHandlers.startRound(roomCode, roomData);
        sendMessageToRoom(roomCode, startRoundResult);
        break;
      }
      case SocketIncoming.SwitchRole: {
        if (roomData.gameStarted) break;

        const switchRoleResult = eventHandlers.switchRole(roomCode, roomData, data.playerId);
        sendMessageToRoom(roomCode, switchRoleResult);
        break;
      }
      case SocketIncoming.PlayCard: {
        if (!roomData.round) break;

        const cardPlayedEvent = eventHandlers.playCard(roomCode, roomData, data.cardPlayed);
        sendMessageToRoom(roomCode, cardPlayedEvent);
        break;
      }
      case SocketIncoming.SelectCard: {
        if (!roomData.round) break;

        const playerSelectedEvent = eventHandlers.selectCard(roomCode, roomData, data.cardSelected);
        sendMessageToRoom(roomCode, playerSelectedEvent);
        break;
      }
      case SocketIncoming.SelectPlayer: {
        if (!roomData.round) break;

        const playerSelectedEvent = eventHandlers.selectPlayer(roomCode, roomData, data.playerSelected);
        sendMessageToRoom(roomCode, playerSelectedEvent);
        break;
      }
      case SocketIncoming.SubmitSelection: {
        if (!roomData.round) break;

        const submittedSelectionResult = eventHandlers.submitSelection(roomCode, roomData);
        sendMessageToRoom(roomCode, submittedSelectionResult);
        break;
      }
      case SocketIncoming.AcknowledgeAction: {
        if (!roomData.round) break;

        const acknowledgedActionResult = eventHandlers.acknowledgeAction(roomCode, roomData);
        sendMessageToRoom(roomCode, acknowledgedActionResult);
        break;
      }
      case SocketIncoming.ResetGame: {
        if (!roomData.gameStarted || !!roomData.round) break;

        const resetGameResult = eventHandlers.resetGame(roomCode, roomData);
        sendMessageToRoom(roomCode, resetGameResult);
        break;
      }
    }
  } catch (err) {
    console.error(err);
    console.info("Socket data", data);
    console.info("Room data", Rooms.get(userSocket.roomCode));
  }
};

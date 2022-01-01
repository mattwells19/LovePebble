import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Player, PlayerId } from "../../../server/types/types";
import { SocketOutgoing } from "../../../server/types/socket.types";

interface UseWebSocketResult {
  players: Map<PlayerId, Player>;
  currentPlayerId: PlayerId;
}

export function useWebSocket(): UseWebSocketResult {
  const navigate = useNavigate();
  const { roomCode = "" } = useParams();
  const [currentPlayerId, setCurrentPlayerId] = useState<PlayerId>("");
  const [players, setPlayers] = useState<Map<PlayerId, Player>>(new Map());

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:3001");

    websocket.addEventListener("open", () => {
      websocket.send(
        JSON.stringify({
          playerName: localStorage.getItem("playerName"),
          roomCode,
          type: "join",
        }),
      );
    });

    websocket.addEventListener("message", (msg: MessageEvent<string>) => {
      const socketMsg: SocketMessage = JSON.parse(msg.data);

      switch (socketMsg.type) {
        case SocketOutgoing.Connected:
          setCurrentPlayerId(socketMsg.data);
          break;
        case SocketOutgoing.PlayerUpdate:
          setPlayers(new Map(socketMsg.data));
          break;
      }
    });

    websocket.addEventListener("error", () => {
      navigate("/");
    });

    return () => {
      websocket.close();
    };
  }, []);

  return { currentPlayerId, players };
}

type SocketMessage = ConnectedEvent | PlayerUpdateEvent;

type ConnectedEvent = {
  type: SocketOutgoing.Connected;
  data: PlayerId;
};

type PlayerUpdateEvent = {
  type: SocketOutgoing.PlayerUpdate;
  data: readonly [string, Player][];
};

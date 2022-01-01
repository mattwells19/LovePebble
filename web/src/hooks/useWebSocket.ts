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
          type: "join",
          roomCode,
          playerName: localStorage.getItem("playerName"),
        }),
      );
    });

    websocket.addEventListener("message", (msg: MessageEvent<string>) => {
      // TODO: need to setup proper types
      const data: { type: string; data: any } = JSON.parse(msg.data);

      switch (data.type) {
        case SocketOutgoing.Connected:
          setCurrentPlayerId(data.data);
          break;
        case SocketOutgoing.PlayerUpdate:
          setPlayers(new Map(data.data));
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

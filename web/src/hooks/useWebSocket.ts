import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Player, PlayerId } from "../../../server/types/types";
import { SocketOutgoing } from "../../../server/types/socket.types";

export function useWebSocket(roomCode: string) {
  const navigate = useNavigate();
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

import { List, ListItem } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppbarText } from "../hooks/useAppbarText";
import { useWebSocket } from "../hooks/useWebSocket";

export const Room = () => {
  const navigate = useNavigate();
  const { roomCode = "" } = useParams();

  if (roomCode === "") {
    navigate("/");
  }

  const { players } = useWebSocket(roomCode);
  useAppbarText(roomCode);

  console.log(players);

  return (
    <>
      <List>
        {Array.from(players, ([playerId, player]) => (
          <ListItem key={playerId}>{player.name}</ListItem>
        ))}
      </List>
    </>
  );
};

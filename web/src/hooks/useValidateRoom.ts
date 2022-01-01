import { useState, useEffect } from "react";
import { useRouterContext } from "../contexts/RouterContext";

type UseValidateRoomResult = "valid" | "pending" | "invalid";

export const useValidateRoom = (roomCode: string): UseValidateRoomResult => {
  const { newRoomCode } = useRouterContext();
  const [validRoom, setValidRoom] = useState<"valid" | "pending" | "invalid">(
    Boolean(newRoomCode) ? "valid" : "pending",
  );

  useEffect(() => {
    if (validRoom === "pending") {
      fetch(`/api/checkRoom?roomCode=${roomCode}`)
        .then((res) => res.text())
        .then((data) => {
          const isValidRoom: boolean = JSON.parse(data);
          setValidRoom(isValidRoom ? "valid" : "invalid");
        });
    }
  }, [validRoom]);

  return validRoom;
};

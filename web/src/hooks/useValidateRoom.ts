import { useState, useEffect } from "react";
import { useRouterContext } from "../contexts/RouterContext";
import { get } from "../utils/get";

type UseValidateRoomResult = "valid" | "pending" | "invalid";

export const useValidateRoom = (roomCode: string): UseValidateRoomResult => {
  const { newRoomCode } = useRouterContext();
  const [validRoom, setValidRoom] = useState<UseValidateRoomResult>(
    newRoomCode && newRoomCode === roomCode ? "valid" : "pending",
  );

  useEffect(() => {
    if (validRoom === "pending") {
      get<boolean>(`/api/checkRoom?roomCode=${roomCode}`)
        .then((isValidRoom) => {
          setValidRoom(isValidRoom ? "valid" : "invalid");
        })
        .catch((errMsg: string) => {
          console.error(errMsg);
          setValidRoom("invalid");
        });
    }
  }, [validRoom]);

  return validRoom;
};

import { Box, Spinner } from "@chakra-ui/react";
import { Route, Routes, Navigate, useParams } from "react-router-dom";
import { Appbar } from "./components/Appbar";
import { GameStateProvider } from "./contexts/GameStateContext";
import { useValidateRoom } from "./hooks/useValidateRoom";
import { Home } from "./pages/Home";
import { PlayerName } from "./pages/PlayerName";
import { Room } from "./pages/Room";

const RoomRouterSwitch = () => {
  const { roomCode = "" } = useParams();
  const validRoom = useValidateRoom(roomCode);

  // make sure room exists; otherwise, redirect back to index page
  if (roomCode === "" || validRoom === "invalid") {
    return <Navigate to="/" />;
  } else if (validRoom === "pending") {
    return <Spinner />;
  }

  // if player hasn't set a name redirect to PlayerName
  if (localStorage.getItem("playerName")) {
    return <Room />;
  } else {
    return <Navigate to={`/name?roomCode=${roomCode}`} />;
  }
};

export const Layout = () => {
  return (
    <>
      <Appbar />
      <Box
        as="main"
        display="flex"
        flexDirection="column"
        gap="12"
        alignItems="center"
        width="sm"
        marginX="auto"
        paddingY="10"
      >
        <Routes>
          <Route index element={<Home />} />
          <Route path="/name" element={<PlayerName />} />
          <Route
            path="/room/:roomCode"
            element={
              <GameStateProvider>
                <RoomRouterSwitch />
              </GameStateProvider>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </>
  );
};

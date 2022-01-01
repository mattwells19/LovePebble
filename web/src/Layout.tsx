import { Box } from "@chakra-ui/react";
import { Route, Routes, Navigate, useParams } from "react-router-dom";
import { Appbar } from "./components/Appbar";
import { Home } from "./pages/Home";
import { PlayerName } from "./pages/PlayerName";
import { Room } from "./pages/Room";

const NameRouterSwitch = () => {
  const { roomCode } = useParams();

  if (localStorage.getItem("playerName")) {
    return <Room />;
  } else {
    return <Navigate to={`/playerName?roomCode=${roomCode}`} />;
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
        gap="20"
        alignItems="center"
        width="sm"
        marginX="auto"
        paddingY="10"
      >
        <Routes>
          <Route index element={<Home />} />
          <Route path="/playerName" element={<PlayerName />} />
          <Route path="/room/:roomCode" element={<NameRouterSwitch />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </>
  );
};

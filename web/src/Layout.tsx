import { chakra } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppbarProvider } from "./contexts/AppbarContext.tsx";
import { Appbar } from "./components/Appbar.tsx";
import { Home, homeAction } from "./pages/Home.tsx";
import { PlayerName, playerNameAction, playerNameLoader } from "./pages/PlayerName.tsx";
import { Room, roomLoader } from "./pages/Room/index.ts";

const router = createBrowserRouter([
  {
    path: "/",
    action: homeAction,
    element: <Home />,
  },
  {
    path: "name",
    action: playerNameAction,
    loader: playerNameLoader,
    element: <PlayerName />,
  },
  {
    path: "room/:roomCode",
    loader: roomLoader,
    element: <Room />,
  },
]);

export const Layout = () => {
  return (
    <AppbarProvider>
      <Appbar />
      <chakra.main
        display="flex"
        flexDirection="column"
        gap="12"
        alignItems="center"
        width="sm"
        marginX="auto"
        paddingY="10"
      >
        <RouterProvider router={router} />
      </chakra.main>
    </AppbarProvider>
  );
};

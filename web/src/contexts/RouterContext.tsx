import { createContext, FC, useContext, useState } from "react";

interface RouterContextValue {
  newRoomCode: string | null;
  setNewRoomCode: (newRoomCode: string | null) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export const RouterProvider: FC = ({ children }) => {
  const [newRoomCode, setNewRoomCode] = useState<string | null>(null);

  return <RouterContext.Provider value={{ newRoomCode, setNewRoomCode }}>{children}</RouterContext.Provider>;
};

export const useRouterContext = (): RouterContextValue => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("Cannot use Router context outside of RouterContextProvider.");
  } else {
    return context;
  }
};

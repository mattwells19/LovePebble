import { createContext, FC, useContext, useState } from "react";

interface AppbarContextValue {
  setAppbarText: (appbarText: string) => void;
  appBarText: string;
}

const AppbarContext = createContext<AppbarContextValue | null>(null);

export const AppbarProvider: FC = ({ children }) => {
  const [appBarText, setAppbarText] = useState<string>("");

  return <AppbarContext.Provider value={{ appBarText, setAppbarText }}>{children}</AppbarContext.Provider>;
};

export const useAppbarContext = () => {
  const context = useContext(AppbarContext);
  if (!context) {
    throw new Error("Cannot use Appbar context outside of AppbarProvider.");
  } else {
    return context;
  }
};

import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

const AppbarTextContext = createContext<string | null>(null);
const SetAppbarTextContext = createContext<React.Dispatch<React.SetStateAction<string>> | null>(null);

export const AppbarProvider = ({ children }: PropsWithChildren) => {
  const [appBarText, setAppbarText] = useState<string>("");

  return (
    <SetAppbarTextContext.Provider value={setAppbarText}>
      <AppbarTextContext.Provider value={appBarText}>{children}</AppbarTextContext.Provider>
    </SetAppbarTextContext.Provider>
  );
};

export const useAppbarText = () => {
  const context = useContext(AppbarTextContext);
  if (context === null) {
    throw new Error("Cannot use Appbar context outside of AppbarProvider.");
  }

  return context;
};

export const useSetAppbarText = (appBarText: string) => {
  const setAppbarText = useContext(SetAppbarTextContext);
  if (!setAppbarText) {
    throw new Error("Cannot use Appbar context outside of AppbarProvider.");
  }

  useEffect(() => {
    setAppbarText(appBarText);
  }, [appBarText]);
};

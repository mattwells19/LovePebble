import { useEffect } from "react";
import { useAppbarContext } from "../contexts/AppbarContext";

/**
 * A hook for setting the text in the Appbar
 * @param appBarText The text to display in the Appbar
 */
export const useAppbarText = (appBarText: string) => {
  const { setAppbarText } = useAppbarContext();

  useEffect(() => {
    setAppbarText(appBarText);
  }, [appBarText]);
};

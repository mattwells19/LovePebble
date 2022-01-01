import { useEffect } from "react";

export const useDocTitle = (docTitle?: string): void => {
  useEffect(() => {
    document.title = docTitle ? `${docTitle} | Love Pebble` : "Love Pebble";
  }, []);
};

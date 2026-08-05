import { createContext, useContext } from "react";

export const ExplorerContext = createContext();

export function useExplorer() {
  return useContext(ExplorerContext);
}

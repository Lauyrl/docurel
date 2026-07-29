import { createContext, useContext } from "react";

export const ExplorerContext = createContext(null);

export function useExplorer() {
    return useContext(ExplorerContext);
}

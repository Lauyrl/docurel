import { useMemo, useState } from "react";
import { ExplorerContext } from "./ExplorerContext";

/**
 * Provides itemMap, setItemMap, currentFolderId, setCurrentFolderId, previewItemId, setPreviewItemId, childrenIndex, rootLevelItemsIndex 
 * for elements inside. Does not build/populate them
 */
export function ExplorerProvider({ children }) {
  // changing any state inside re-renders the ExplorerProvider (recomputes the values defined in it (currentFolder, previewItem,...), not the states themselves), 
  // except memoized values, which are only re-computed when their dependencies change
  const [itemMap, setItemMap] = useState(new Map);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [previewItemId, setPreviewItemId] = useState(null);

  const childrenIndex = useMemo(() => {
      const index = new Map();
      for (const item of itemMap.values()) {
        if (!index.has(item.publicParentId)) index.set(item.publicParentId, []);
        index.get(item.publicParentId).push(item);
      }
      return index;
    }, [itemMap]);

  const rootLevelItemsIndex = useMemo(() => {
      const index = [];
      for (const item of itemMap.values()) {
        if (item.publicParentId == null) index.push(item); 
      }
      return index
    }, [itemMap])

	const currentFolder = itemMap.get(currentFolderId);
	const previewItem   = itemMap.get(previewItemId);

  return (
    <ExplorerContext.Provider value={{
      itemMap, currentFolderId, previewItemId, childrenIndex, rootLevelItemsIndex,
      setItemMap, setCurrentFolderId, setPreviewItemId,

      currentFolder, previewItem,
    }}>
      {children}
    </ExplorerContext.Provider>
  );
}

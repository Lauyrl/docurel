import { useMemo, useState } from "react";
import { ExplorerContext } from "./ExplorerContext";

/**
 * Provides itemMap, setItemMap, currentFolderId, setCurrentFolderId, previewItemId, setPreviewItemId, childrenIndex, rootLevelItemsIndex 
 * for elements inside. Does not build/populate them
 */
export function ExplorerProvider({ children }) {
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

  function getItem(publicId) { return itemMap.get(publicId); }
	const currentFolder = getItem(currentFolderId);
	const previewItem   = getItem(previewItemId);

  return (
    <ExplorerContext.Provider value={{
      currentFolderId, previewItemId, childrenIndex, rootLevelItemsIndex,
      setItemMap, setCurrentFolderId, setPreviewItemId,

      currentFolder, previewItem,

      getItem
    }}>
      {children}
    </ExplorerContext.Provider>
  );
}

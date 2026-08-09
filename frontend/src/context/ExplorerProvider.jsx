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
  const [filteredItemIdSet, setFilteredItemIdSet] = useState(null); // new Set

  const [itemNavigationStackForward, setItemNavigationStackForward] = useState([]);
  const [itemNavigationStackBackward, setItemNavigationStackBackward] = useState([]);

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

  const canModifyCurrentFolderContents = (currentFolder && (currentFolder.permission === "OWNER" || currentFolder.permission === "EDITOR"))
  
  function canModifyParentContents(item) {
    const parent = itemMap.get(item.publicParentId);
    return (parent && (parent.permission === "OWNER" || parent.permission === "EDITOR"));
  }

  function rebuildNavigationStacks(stackTopId) {
    let path = []
    let folder = itemMap.get(stackTopId);
    while (folder) {
      path.push(folder);
      folder = itemMap.get(folder.publicParentId);
    }
    setItemNavigationStackBackward(path.reverse());
    setItemNavigationStackForward([]);
  }

  function navigateItems(isBackward) {
    let backward = [...itemNavigationStackBackward];
    let forward = [...itemNavigationStackForward];
    if (isBackward) {
      if (backward.length === 0) return;
      let popped = backward.pop();
      forward.push(popped);
    } else {
      if (forward.length === 0) return;
      let popped = forward.pop();
      backward.push(popped);
    }
    setItemNavigationStackBackward(backward);
    setItemNavigationStackForward(forward);
    
    if (backward.length === 0) setCurrentFolderId(null);
    else setCurrentFolderId(backward[backward.length - 1].publicId);
  }

  return (
    <ExplorerContext.Provider value={{
      itemMap, currentFolderId, previewItemId, childrenIndex, rootLevelItemsIndex, itemNavigationStackForward, itemNavigationStackBackward, filteredItemIdSet,
      setItemMap, setCurrentFolderId, setPreviewItemId, setFilteredItemIdSet,

      currentFolder, previewItem, canModifyCurrentFolderContents,

      canModifyParentContents, rebuildNavigationStacks, navigateItems
    }}>
      {children}
    </ExplorerContext.Provider>
  );
}

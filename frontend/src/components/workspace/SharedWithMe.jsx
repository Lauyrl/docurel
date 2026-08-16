import { useEffect, useState } from "react";
import { useExplorer } from "../../context/ExplorerContext";
import { api } from "../../api";
import FolderContentsView from "./views/FolderContentsView";

function SharedWithMe({ draggedItem, renderItemListing }) {
  const {setItemMap, setCurrentFolderId, currentFolder, childrenIndex, rootLevelItemsIndex, rebuildNavigationStacks, setFilteredItemIdSet} = useExplorer();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    api("/shared")
      .then(response => response.json())
      .then((items) => {
        const itemMapTemp = new Map;
        items.forEach(item => itemMapTemp.set(item.publicId, item));
        setItemMap(itemMapTemp);
        rebuildNavigationStacks(null);
        setCurrentFolderId(null);
        setFilteredItemIdSet(null);
      })
      .finally(() => setLoading(false));
  }, []);

  let currentFolderChildren;
  if (currentFolder == null) {
    currentFolderChildren = rootLevelItemsIndex;
  }
  else {
    currentFolderChildren = (childrenIndex.get(currentFolder.publicId) ?? []);
  }

  return (
    <FolderContentsView
      currentPageIdx={1}
      currentFolderChildren={currentFolderChildren}
      draggedItem={draggedItem}
      renderItemListing={renderItemListing}
      loading={loading}
    />
  );
}

export default SharedWithMe;

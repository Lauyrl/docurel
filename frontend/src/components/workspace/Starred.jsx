import { useEffect } from "react";
import { api } from "../../api";
import FolderContentsView from "./views/FolderContentsView";
import { useExplorer } from "../../context/ExplorerContext";

function Starred({ renderItemListing }) {
  const { setItemMap, topLevelStarred, setCurrentFolderId, currentFolder, childrenIndex, rebuildNavigationStacks, setFilteredItemIdSet } = useExplorer();

  useEffect(() => {
    api("/starred")
      .then(response => response.json())
      .then((items) => {
        const itemMapTemp = new Map;
        items.forEach(item => itemMapTemp.set(item.publicId, item));
        setItemMap(itemMapTemp);
        rebuildNavigationStacks(null);
        setCurrentFolderId(null);
        setFilteredItemIdSet(null);
      });
  }, []);

  let currentFolderChildren;
  if (currentFolder == null) {
    currentFolderChildren = topLevelStarred;
  }
  else {
    currentFolderChildren = (childrenIndex.get(currentFolder.publicId) ?? []);
  }

  return (
    <FolderContentsView
      currentPageIdx={3}
      currentFolderChildren={currentFolderChildren}
      renderItemListing={renderItemListing}
    />
  );
}

export default Starred;

import { useEffect } from "react";
import { useExplorer } from "../../../context/ExplorerContext";
import { api } from "../../../api";
import "./css/FolderContentsView.css"
import FolderContentsView from "./components/FolderContentsView";

function SharedWithMe({ draggedItem, renderItemListing }) {
  const {setItemMap, currentFolder, childrenIndex, rootLevelItemsIndex} = useExplorer();

  useEffect(() => {
    api("/shared")
      .then(response => response.json())
      .then((items) => {
        const itemMapTemp = new Map;
        items.forEach(item => itemMapTemp.set(item.publicId, item));
        setItemMap(itemMapTemp);
      })
  }, [setItemMap]);

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
    />
  );
}

export default SharedWithMe;

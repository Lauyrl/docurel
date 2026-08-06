import { useEffect } from "react";
import { useExplorer } from "../../../context/ExplorerContext";
import { api } from "../../../api";

function SharedWithMe({ renderItemListing }) {
  const {itemMap, setItemMap, childrenIndex, rootLevelItemsIndex, currentFolderId, previewItemId} = useExplorer();

  useEffect(() => {
    api("/shared")
      .then(response => response.json())
      .then((itemPermissions) => {
        const itemMapTemp = new Map;
        itemPermissions.forEach(itemPermission => itemMapTemp.set(itemPermission.item.publicId, itemPermission));
        setItemMap(itemMapTemp);
      })
  }, [setItemMap]);

  function displayItem(item) {
    return (
      <div>
        <div> {item.type === "FOLDER" ? "📁" : "📄"} </div>
        <div> {item.name} </div>
      </div>
    );
  }

  return (
    <div>
      <div className="selected-item">
        {(!itemMap || itemMap.size === 0) && <> No items have been shared with you. </>}
        <div className="folder-grid-item-listing">
          {rootLevelItemsIndex.map((item) => (renderItemListing(item, displayItem)))}
        </div>
      </div>
    </div>
  );
}

export default SharedWithMe;

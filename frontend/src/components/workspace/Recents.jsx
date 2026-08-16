import { useEffect, useState } from "react";
import { useExplorer } from "../../context/ExplorerContext";
import { api } from "../../api";
import RecentsView from "./views/RecentsView";

function Recents({ renderItemListing }) {
  const {setItemMap, setCurrentFolderId, rootLevelItemsIndex, rebuildNavigationStacks, setFilteredItemIdSet} = useExplorer();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/recents")
      .then(response => response.json())
      .then((items) => {
        const itemMapTemp = new Map;
        items.forEach(item => itemMapTemp.set(item.publicId, item));
        setItemMap(itemMapTemp);
        setCurrentFolderId(null);
        setFilteredItemIdSet(null);
        rebuildNavigationStacks(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <RecentsView
      recents={rootLevelItemsIndex}
      renderItemListing={renderItemListing}
      loading={loading}
    />
  );
}

export default Recents;

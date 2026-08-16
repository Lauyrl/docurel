import "./css/FolderContentsView.css";
import { useExplorer } from "../../../context/ExplorerContext";
import { File, Folder, Star } from "lucide-react";
import useExplorerOperations from "../../../context/useExplorerOperations";
import Breadcrumbs from "./Breadcrumbs";
import FolderContentsViewSkeleton from "./skeletons/FolderContentsViewSkeleton";

const CURRENT_VIEW = "folder_contents";

function FolderContentsView({ currentPageIdx, currentFolderChildren, draggedItem, renderItemListing, loading }) {
  const { currentFolder } = useExplorer();
  const { selectItem, patchItem, filterAndSortItemsList } = useExplorerOperations(currentPageIdx);

  function displayItem(item, itemRename, renameDialogue, currentView, setCurrentView) {
    return (
      <div onMouseEnter={() => setCurrentView(CURRENT_VIEW)}>
        {item.type === "FOLDER" ? <Folder fill="grey" size={60} /> : <File fill="grey" size={60} />}
        <div className="item-name"> 
          {(itemRename?.item?.publicId !== item.publicId || currentView !== CURRENT_VIEW) ? 
            <span>{item.name}</span> : renameDialogue(item)}
          {item.starred && <Star fill="rgb(251, 205, 121)"/>} 
        </div>
      </div>
    );
  }

  const filtered = filterAndSortItemsList(currentFolderChildren);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", width: "100%" }}>
      <Breadcrumbs
        currentPageIdx={currentPageIdx}
        renderItemListing={renderItemListing}
      />
      <div
        className="selected-folder"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          selectItem(currentFolder);
          if (draggedItem) patchItem(draggedItem, null, currentFolder.publicId);
        }}
      >
        {
          loading ?
            <FolderContentsViewSkeleton count={8} /> :
            <>
              {filtered.length === 0 && <> This folder is empty. </>}
              <div className="folder-grid-item-listing">
                {filtered.map((item) => (renderItemListing(item, displayItem, false, (currentPageIdx !== 2 && currentPageIdx !== 3))))}
              </div>
            </>
        }
      </div>
    </div>
  );
}

export default FolderContentsView;

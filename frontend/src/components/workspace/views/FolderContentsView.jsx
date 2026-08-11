import "./css/FolderContentsView.css";
import { useExplorer } from "../../../context/ExplorerContext";
import { File, Folder } from "lucide-react";
import useExplorerOperations from "../../../context/useExplorerOperations";
import Breadcrumbs from "./Breadcrumbs";

function FolderContentsView({ currentPageIdx, currentFolderChildren, draggedItem, renderItemListing }) {
  const { currentFolder } = useExplorer();
  const { selectItem, patchItem, filterAndSortItemsList } = useExplorerOperations(currentPageIdx);

  function displayItem(item) {
    return (
      <div>
        {item.type === "FOLDER" ? <Folder fill="grey" size={60} /> : <File fill="grey" size={60} />}
        <div> {item.name} </div>
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
        {filtered.length === 0 && <> This folder is empty. </>}
        <div className="folder-grid-item-listing">
          {filtered.map((item) => (renderItemListing(item, displayItem, false, (currentPageIdx !== 2))))}
        </div>
      </div>
    </div>
  );
}

export default FolderContentsView;

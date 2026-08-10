import "./css/FolderContentsView.css";
import { useExplorer } from "../../../context/ExplorerContext";
import { File, Folder } from "lucide-react";
import useExplorerOperations from "../../../context/useExplorerOperations";
import Breadcrumbs from "./Breadcrumbs";

function FolderContentsView({ currentPageIdx, currentFolderChildren, draggedItem, renderItemListing }) {
  const { currentFolder, filterValues, sortValues } = useExplorer();
  const { selectItem, patchItem } = useExplorerOperations(currentPageIdx);

  function displayItem(item) {
    return (
      <div>
        {item.type === "FOLDER" ? <Folder fill="grey" size={60} /> : <File fill="grey" size={60} />}
        <div> {item.name} </div>
      </div>
    );
  }

  const filtered = currentFolderChildren.filter(item => {
    if (filterValues.type          && item.type !== filterValues.type) return false;
    if (filterValues.contentType   && item.contentType !== filterValues.contentType) return false;
    if (filterValues.createdAfter  && new Date(item.createdAt) < filterValues.createdAfter)  return false;
    if (filterValues.createdBefore && new Date(item.createdAt) > filterValues.createdBefore) return false;
    if (filterValues.updatedAfter  && new Date(item.updatedAt) < filterValues.updatedAfter)  return false;
    if (filterValues.updatedBefore && new Date(item.updatedAt) > filterValues.updatedBefore) return false;
    return true;
  });
  filtered.sort((a, b) => {
    let result;
    switch (sortValues.sortBy) {
      case "Alphabetical":
        result = a.name.localeCompare(b.name); break;
      case "Size":
        result = a.sizeBytes - b.sizeBytes; break;
      case "Date created":
        result = new Date(a.createdAt) - new Date(b.createdAt); break;
      case "Date updated":
        result = new Date(a.updatedAt) - new Date(b.updatedAt); break;
      default: result = a.name.localeCompare(b.name); break;
    }
    return sortValues.descending ? -result : result;
  });

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
          {filtered.map((item) => (renderItemListing(item, displayItem, false)))}
        </div>
      </div>
    </div>
  );
}

export default FolderContentsView;

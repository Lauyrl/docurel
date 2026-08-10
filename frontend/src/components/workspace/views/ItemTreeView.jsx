import "./css/ItemTreeView.css";
import { File, Folder } from "lucide-react";
import { useExplorer } from "../../../context/ExplorerContext";
import useExplorerOperations from "../../../context/useExplorerOperations";

function ItemTreeView({ root, draggedItem, renderItemListing }) {
  const { childrenIndex, filterValues, sortValues } = useExplorer();
  const { selectItem, patchItem } = useExplorerOperations(0);

  function displayItem(item) {
    return (
      <div className="item">
        <span className="item-arrow">
          {" "}
          {item.type === "FOLDER" ? (item.isExpanded ? "▼" : "▶") : ""}{" "}
        </span>
        {item.type === "FOLDER" ? <Folder /> : <File />}
        <span> {item.name} </span>
      </div>
    );
  }

  function displayFolderContents(folderRoot, depth) {
    const children = childrenIndex.get(folderRoot.publicId) ?? []
    const filtered = children.filter(item => {
      if (item.type === "FOLDER") return true;
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
      <div className="doc-list">
        {
          filtered.map(item => {
            return (
              <>
                <div style={{ marginLeft: depth * 20 }}>
                  {renderItemListing(item, displayItem, true)}
                </div>
                {item.type === "FOLDER" && item.isExpanded && (displayFolderContents(item, depth + 1))}
              </>
            );
          })
        }
      </div>
    );
  }

  if (!root) return;

  const rootChildren = childrenIndex.get(root.publicId) ?? [];
  return (
    <div
      className="vertical-item-listing"
      onClick={() => selectItem(root)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        selectItem(root);
        if (draggedItem) patchItem(draggedItem, null, root.publicId);
      }}
    >
      <div className="title-bar"> Tree view </div>
      {rootChildren.length === 0 && <h2> Upload a file </h2>}
      {rootChildren.length !== 0 && displayFolderContents(root, 0)}
    </div>
  );
}

export default ItemTreeView;

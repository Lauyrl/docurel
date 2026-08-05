import { useExplorer } from "../context/ExplorerContext";
import useExplorerOperations from "../context/useExplorerOperations";
import "./css/ItemTreeView.css";

function ItemTreeView({root, draggedItem, renderItemListing}) {
  const {childrenIndex} = useExplorer();
  const {selectItem, patchItem} = useExplorerOperations(0);

  function displayItem(item) {
    return (
      <div className="item">
        <span className="item-arrow">
          {" "}
          {item.type === "FOLDER" ? (item.isExpanded ? "▼" : "▶") : ""}{" "}
        </span>
        <span> {item.type === "FOLDER" ? "📁" : "📄"} </span>
        <span> {item.name} </span>
      </div>
    );
  }

  function displayFolderContents(folderRoot, depth) {
    return(
      <div className="doc-list">
        { 
          (childrenIndex.get(folderRoot.publicId) ?? []).map(item => {
            return (
              <>
                <div style={{ marginLeft: 5 + depth * 20 }}>
                  {renderItemListing(item, displayItem)}
                </div>
                {item.type === "FOLDER" && item.isExpanded && displayFolderContents(item, depth + 1)}
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
      { rootChildren === 0 && <h2> Upload a file </h2> }
      { rootChildren !== 0 && displayFolderContents(root, 0) }
    </div>
  );
}

export default ItemTreeView;

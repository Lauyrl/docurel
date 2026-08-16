import "./css/ItemTreeView.css";
import { File, Folder, Star } from "lucide-react";
import { useExplorer } from "../../../context/ExplorerContext";
import useExplorerOperations from "../../../context/useExplorerOperations";
import ItemTreeViewSkeleton from "./skeletons/ItemTreeViewSkeleton";

const CURRENT_VIEW = "tree";

function ItemTreeView({ root, draggedItem, renderItemListing, loading }) {
  const { childrenIndex } = useExplorer();
  const { selectItem, patchItem, filterAndSortItemsList } = useExplorerOperations(0);

  function displayItem(item, itemRename, renameDialogue, currentView, setCurrentView) {
    return (
      <div className="item" onMouseEnter={() => setCurrentView(CURRENT_VIEW)}>
        <span className="item-arrow">
          {item.type === "FOLDER" ? (item.isExpanded ? "▼" : "▶") : ""}
        </span>

        <div className="item-name-left-align">
          {item.type === "FOLDER" ? <Folder /> : <File />}
          <div className="item-name-text">
            {(itemRename?.item?.publicId !== item.publicId || currentView !== CURRENT_VIEW) ? 
              item.name : renameDialogue(item)}
          </div>
          {item.starred && <Star fill="rgb(251, 205, 121)"/>} 
        </div>
      </div>
    );
  }

  function displayFolderContents(folderRoot, depth) {
    const children = childrenIndex.get(folderRoot.publicId) ?? []
    const filtered = filterAndSortItemsList(children, true);
    return (
      <div className="doc-list">
        {
          filtered.map(item => {
            return (
              <>
                <div style={{ marginLeft: depth * 20 }}>
                  {renderItemListing(item, displayItem, true, true, false)}
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
      {
        loading ?
          <ItemTreeViewSkeleton /> :
          <>
            {rootChildren.length === 0 && <h2> Upload a file </h2>}
            {rootChildren.length !== 0 && displayFolderContents(root, 0)}
          </>
      }
    </div>
  );
}

export default ItemTreeView;

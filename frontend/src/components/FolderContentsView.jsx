import "./css/FolderContentsView.css";
import { useExplorer } from "../ExplorerContext";

function FolderContentsView({draggedItem, renderItemListing}) {
  const {childrenIndex, currentFolder, selectItem, patchItem} = useExplorer(); 

  function displayItem(item) {
    return (
      <div>
        <div> {item.type === "FOLDER" ? "📁" : "📄"} </div>
        <div> {item.name} </div>
      </div>
    );
  }

  if (!currentFolder) return null;

  const currentFolderChildren = (childrenIndex.get(currentFolder.publicId) ?? []);
  return (
    <div 
      className="selected-item"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        selectItem(currentFolder);
        if (draggedItem) patchItem(draggedItem, null, currentFolder.publicId);
      }}
    >
      {currentFolderChildren.length === 0 && <> This folder is empty. </>}
      <div className="folder-grid-item-listing">
        {currentFolderChildren.map((item) => (renderItemListing(item, displayItem)))}
      </div>
    </div>
  );
}

export default FolderContentsView;

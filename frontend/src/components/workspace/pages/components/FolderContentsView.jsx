import "../css/FolderContentsView.css";
import { useExplorer } from "../../../../context/ExplorerContext";
import useExplorerOperations from "../../../../context/useExplorerOperations";

function FolderContentsView({currentPageIdx, currentFolderChildren, draggedItem, renderItemListing}) {
  const {currentFolder} = useExplorer(); 
  const {selectItem, patchItem} = useExplorerOperations(currentPageIdx);

  function displayItem(item) {
    return (
      <div>
        <div> {item.type === "FOLDER" ? "📁" : "📄"} </div>
        <div> {item.name} </div>
      </div>
    );
  }

  return (
    <div 
      className="selected-folder"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        selectItem(currentFolder);
        if (draggedItem) patchItem(draggedItem, null, currentFolder.publicId);
      }}
    >
      {currentFolderChildren.length === 0 && <> This folder is empty. </>}
      <div className="folder-grid-item-listing">
        {currentFolderChildren.map((item) => (renderItemListing(item, displayItem, false)))}
      </div>
    </div>
  );
}

export default FolderContentsView;

import "./css/FolderContentsView.css";
import { useExplorer } from "../ExplorerContext";

function FolderContentsView({renderItemListing}) {
  const {childrenIndex, currentFolder} = useExplorer(); 

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
    <div className="selected-item">
      {currentFolderChildren.length === 0 && <> This folder is empty. </>}
      <div className="folder-grid-item-listing">
        {currentFolderChildren.map((item) => (renderItemListing(item, displayItem)))}
      </div>
    </div>
  );
}

export default FolderContentsView;

import "./css/SelectedItem.css";
import { useExplorer } from "../ExplorerContext";

function SelectedItem({renderItemListing}) {
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
  /* preview.name === selectedItem.name: avoid trying to render an older selectedItem's URL with an element meant for the current selectedItem's contentType,
  can happen because selectedItem changes before the new blob fetch finishes */
  return (
    <div className="selected-item">
      {currentFolderChildren.length === 0 && <> This folder is empty. </>}
      <div className="folder-grid-item-listing">
        {currentFolderChildren.map((item) => (renderItemListing(item, displayItem)))}
      </div>
    </div>
  );
}

export default SelectedItem;

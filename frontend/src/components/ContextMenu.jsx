import "./css/ContextMenu.css";
import "../css/common.css";
import { useExplorer } from "../context/ExplorerContext";

function ContextMenu({ contextMenu, setContextMenu, onItemDownload, onItemDelete, onItemRename, onItemEditPermissions, onItemStar }) {
  const {canModifyParentContents} = useExplorer();

  function renderContextButton(label, contextAction) {
    return (
      <div 
        className="context-item"
        onClick={(e) => {
          e.stopPropagation();
          contextAction(contextMenu.item);
          setContextMenu(null);
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        { label }
      </div>
    );
  }

  // outer element already checks contextMenu and contextMenu.item
  return (
    <div 
      className="overlay-no-color" 
      onClick={() => setContextMenu(null)}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu(null);
      }}
    >
      <div
        className="context-menu"
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        style={{
          position: "fixed",
          left: contextMenu.x,
          top: contextMenu.y,
        }}
      >
        <div>
          { contextMenu.item.type === "DOCUMENT"      && renderContextButton("Download"        , onItemDownload) }
          { canModifyParentContents(contextMenu.item) && renderContextButton("Delete"          , onItemDelete) }
          { canModifyParentContents(contextMenu.item) && renderContextButton("Rename"          , onItemRename) }
          { contextMenu.item.permission === "OWNER"   && renderContextButton("Edit Permissions", onItemEditPermissions ) }
          { renderContextButton("Star", onItemStar) }
          { renderContextButton("Share to...", () => {}) }
        </div>
      </div>
    </div>
  );
}

export default ContextMenu;

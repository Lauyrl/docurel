import "./css/ContextMenu.css";
import "./css/common.css";

function ContextMenu({ contextMenu, setContextMenu, onItemDownload, onItemDelete, onItemRename, onItemEditPermissions }) {
  
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

  return (
    <div className="overlay" onClick={() => setContextMenu(null)}>
      <div
        className="context-menu"
        style={{
          position: "fixed",
          left: contextMenu.x,
          top: contextMenu.y,
        }}
      >
        <div>
          { contextMenu.item?.type === "DOCUMENT" && renderContextButton("Download", onItemDownload) }
          { renderContextButton("Delete"          , onItemDelete          ) }
          { renderContextButton("Rename"          , onItemRename          ) }
          { renderContextButton("Edit Permissions", onItemEditPermissions ) }
        </div>
      </div>
    </div>
  );
}

export default ContextMenu;

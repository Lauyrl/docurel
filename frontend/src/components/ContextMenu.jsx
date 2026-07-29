import "./css/ContextMenu.css";

function ContextMenu({ contextMenu, setContextMenu, onItemDownload, onItemDelete, onItemRename }) {
  
  function contextButton(label, contextAction) {
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
    <div
      className="context-menu"
      style={{
        position: "fixed",
        left: contextMenu.x,
        top: contextMenu.y,
      }}
    >
      {contextMenu.item?.type === "DOCUMENT" && (
        <div>
          { contextButton("Download", onItemDownload) }
          { contextButton("Delete"  , onItemDelete  ) }
          { contextButton("Rename"  , onItemRename  ) }
        </div>
      )}
      {contextMenu.item?.type === "FOLDER" && (
        <div>
          { contextButton("Delete"  , onItemDelete) }
          { contextButton("Rename"  , onItemRename) }
        </div>
      )}
    </div>
  );
}

export default ContextMenu;

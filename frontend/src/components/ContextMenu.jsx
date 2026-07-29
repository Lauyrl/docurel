import "./css/ContextMenu.css";

function ContextMenu({ contextMenu, setContextMenu, onItemDownload, onItemDelete, onItemRename }) {
  
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
          { renderContextButton("Download", onItemDownload) }
          { renderContextButton("Delete"  , onItemDelete  ) }
          { renderContextButton("Rename"  , onItemRename  ) }
        </div>
      )}
      {contextMenu.item?.type === "FOLDER" && (
        <div>
          { renderContextButton("Delete"  , onItemDelete) }
          { renderContextButton("Rename"  , onItemRename) }
        </div>
      )}
    </div>
  );
}

export default ContextMenu;

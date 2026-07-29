function ContextMenu({ contextMenu, setContextMenu, onItemDownload, onItemDelete, onItemRename }) {
  let downloadButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onItemDownload(contextMenu.item.publicId);
        setContextMenu(null);
      }}
    >
      Download
    </button>
  );

  let deleteButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onItemDelete(contextMenu.item);
        setContextMenu(null);
      }}
    >
      Delete
    </button>
  );
  
  let renameButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onItemRename(contextMenu.item);
        setContextMenu(null);
      }}
    >
      Rename
    </button>
  );

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
          { downloadButton } <br />
          { deleteButton }   <br />
          { renameButton }
        </div>
      )}
      {contextMenu.item?.type === "FOLDER" && (
        <div>
          { deleteButton } <br />
          { renameButton }
        </div>
      )}
    </div>
  );
}

export default ContextMenu;

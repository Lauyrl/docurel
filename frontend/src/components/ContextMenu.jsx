function ContextMenu({ contextMenu, setContextMenu, downloadDocumentRedirect, onItemDelete }) {
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadDocumentRedirect(contextMenu.item.publicId);
              setContextMenu(null);
            }}
          >
            Download
          </button>
          <br />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onItemDelete(contextMenu.item);
              setContextMenu(null);
            }}
          >
            Delete
          </button>
        </div>
      )}
      {contextMenu.item?.type === "FOLDER" && (
        <div>
          <button onClick={(e) => {
            e.stopPropagation();
            onItemDelete(contextMenu.item)
            setContextMenu(null);
          }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default ContextMenu;

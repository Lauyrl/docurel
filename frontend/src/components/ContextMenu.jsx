function ContextMenu({ contextMenu, downloadDocumentRedirect, onItemDelete }) {
  return (
    <div
      className="context-menu"
      style={{
        position: "fixed",
        left: contextMenu.x,
        top: contextMenu.y,
      }}
    >
      {contextMenu.item?.type === "document" && (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadDocumentRedirect(contextMenu.item.name);
            }}
          >
            Download
          </button>
          <br />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onItemDelete(contextMenu.item);
            }}
          >
            Delete
          </button>
        </div>
      )}
      {contextMenu.item?.type === "folder" && (
        <div>
          <button onClick={() => onItemDelete(contextMenu.item)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default ContextMenu;

function ContextMenu({ contextMenu, downloadDocumentRedirect, deleteItem }) {
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
              deleteItem(contextMenu.item.name);
            }}
          >
            Delete
          </button>
        </div>
      )}
      {contextMenu.item?.type === "folder" && (
        <div>
          <button onClick={() => deleteItem(contextMenu.item.name)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default ContextMenu;

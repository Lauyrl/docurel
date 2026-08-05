import "./css/Workspace.css";
import "./css/common.css";
import ItemTreeView from "./ItemTreeView";
import FolderContentsView from "./FolderContentsView";
import ContextMenu from "./ContextMenu";
import PreviewOverlay from "./PreviewOverlay";
import PermissionsEdit from "./PermissionsEdit";
import { useState } from "react";
import { useExplorer } from "../ExplorerContext";
import { downloadDocumentRedirect } from "../pages/common";

function Workspace() {
  const {childrenIndex, selectItemInMyFiles, deleteItemInMyFiles, patchItemInMyFiles} = useExplorer();

  const [contextMenu, setContextMenu] = useState({
    item: null,
    x: null,
    y: null,
  });

  const [itemToEditUserPermissionsOf, setItemToEditUserPermissionsOf] = useState(null);

  const [itemRename, setItemRename] = useState({
    item: null,
    newName: null,
  });

  const [draggedItem, setDraggedItem] = useState(null);

  function makeContextMenu(eventObject, item) {
    setContextMenu({
      item: item,
      x: eventObject.clientX,
      y: eventObject.clientY,
    });
  }

  function isDescendant(potentialDescendantItem, potentialAncestorItem) {
    if (potentialAncestorItem.type !== "FOLDER") return false;
    for (const child of childrenIndex.get(potentialAncestorItem.publicId) ??
      []) {
      if (
        child.publicId === potentialDescendantItem.publicId ||
        (child.type === "FOLDER" &&
          isDescendant(potentialDescendantItem, child))
      )
        return true;
    }
    return false;
  }

  function canDropInto(destinationItem) {
    return (
      draggedItem &&
      destinationItem.type === "FOLDER" &&
      destinationItem.publicId !== draggedItem?.publicId &&
      destinationItem.publicId !== draggedItem?.publicParentId &&
      !(
        draggedItem.type === "FOLDER" &&
        isDescendant(destinationItem, draggedItem)
      )
    );
    /* deny dragging a folder into one of its' descendant folders, causing a cyclic relationship */
  }

  function renderItemListing(item, displayItem) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          selectItemInMyFiles(item);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          makeContextMenu(e, item);
        }}

        draggable
        onDragStart={() => setDraggedItem(item)}
        onDragEnd={() => setDraggedItem(null)}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (canDropInto(item)) {
            e.stopPropagation();
            selectItemInMyFiles(item);
            patchItemInMyFiles(draggedItem, null, item.publicId);
          }
        }}
      >
        {itemRename?.item?.publicId !== item.publicId && displayItem(item) }
        {itemRename?.item?.publicId === item.publicId && (
          <>
            <div className="in-place-overlay" onClick={(e) => {
              e.stopPropagation();
              setItemRename(null);
            }}> </div>

            <div 
              onClick={(e) => e.stopPropagation()}
              style={{zIndex: 1100, position: "relative"}}
            >
              <input
                autoFocus
                type="text"
                value={itemRename.newName}
                onChange={(e) =>
                  setItemRename({ item: item, newName: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const newName = itemRename.newName.trim(); // trim spaces so that "  " or similar wouldn't be accepted
                    if (newName && newName != "") {
                      patchItemInMyFiles(itemRename.item, newName, null);
                      setItemRename(null);
                    }
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {
        contextMenu && contextMenu.item &&
        <ContextMenu 
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          onItemDownload={downloadDocumentRedirect}
          onItemDelete={deleteItemInMyFiles}
          onItemRename={(item) => {setItemRename({item: item, newName: item.name})}}
          onItemEditPermissions={(item) => {setItemToEditUserPermissionsOf(item)}}
        />
      }
      {
        itemToEditUserPermissionsOf && 
        <PermissionsEdit
          itemToEditUserPermissionsOf={itemToEditUserPermissionsOf}
          setItemToEditUserPermissionsOf={setItemToEditUserPermissionsOf}
        />
      }
      <div className="workspace">
        <ItemTreeView
          draggedItem={draggedItem}
          renderItemListing={renderItemListing}
        />
        <FolderContentsView 
          draggedItem={draggedItem}
          renderItemListing={renderItemListing}
        />
        <PreviewOverlay />
      </div>
    </>
  );
}

export default Workspace;

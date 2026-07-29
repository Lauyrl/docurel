import "./css/Workspace.css";
import ItemList from "./ItemList";
import SelectedItem from "./SelectedItem";
import ContextMenu from "./ContextMenu";
import { useEffect, useState } from "react";
import { API } from "../constants";
import { useExplorer } from "../ExplorerContext";

function Workspace() {
  const {childrenIndex, selectItem, patchItem} = useExplorer();
  function onItemClick(item) {
    selectItem(item);
    setContextMenu(null);
  }

  const [contextMenu, setContextMenu] = useState({
    item: null,
    x: null,
    y: null,
  });

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

  function downloadDocumentRedirect(item) {
    /* window.location: Location object of the browser window, window.location.href: the full URL the browser is displaying */
    window.open(API + "document/" + item.publicId + "/download");
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

  useEffect(() => {
    const close = () => {
      setContextMenu(null);
      setItemRename(null);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  function renderItemListing(item, displayItem) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          setContextMenu(null);
          onItemClick(item);
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
            onItemClick(item);
            patchItem(draggedItem, null, item.publicId);
          }
        }}
      >
        {itemRename?.item?.publicId !== item.publicId && displayItem(item) }
        {itemRename?.item?.publicId === item.publicId && (
          <div onClick={(e) => e.stopPropagation()}>
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
                    patchItem(itemRename.item, newName, null);
                    setItemRename(null);
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {contextMenu && contextMenu.item &&
        <ContextMenu 
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          onItemDownload={downloadDocumentRedirect}
          onItemRename={(item) => {setItemRename({item: item, newName: item.name})}}
        />
      }
      <div className="workspace">
        <ItemList
          draggedItem={draggedItem}
          renderItemListing={renderItemListing}
        />
        <SelectedItem 
          renderItemListing={renderItemListing}
        />
      </div>
    </>
  );
}

export default Workspace;

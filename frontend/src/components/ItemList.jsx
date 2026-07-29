import { useEffect, useState } from "react";
import { API } from "../constants";
import ContextMenu from "./ContextMenu";

function ItemList({ root, childrenIndex, onItemClick, onItemDelete, onItemPatch }) {
  const [contextMenu, setContextMenu] = useState({
    item: null,
    x: null,
    y: null
  });

  const [itemRename, setItemRename] = useState({
    item: null,
    newName: null
  });

  const [draggedItem, setDraggedItem] = useState(null);

  function makeContextMenu(eventObject, item) {
    setContextMenu({
      item: item,
      x: eventObject.clientX,
      y: eventObject.clientY
    });
  }

  function downloadDocumentRedirect(publicId) {
    /* window.location: Location object of the browser window, window.location.href: the full URL the browser is displaying */
    window.open(API + "document/" + publicId + "/download");
  }

  function isDescendant(potentialDescendantItem, potentialAncestorItem) {
    if (potentialAncestorItem.type !== "FOLDER") return false;
    for (const child of (childrenIndex.get(potentialAncestorItem.publicId) ?? [])) {
      if (child.publicId === potentialDescendantItem.publicId || 
         (child.type === "FOLDER" && isDescendant(potentialDescendantItem, child))) return true;
    } 
    return false;
  }

  function canDropInto(destinationItem) {
    return (draggedItem && 
            destinationItem.type === "FOLDER" && 
            destinationItem.publicId !== draggedItem?.publicId && 
            destinationItem.publicId !== draggedItem?.publicParentId &&
            !(draggedItem.type === "FOLDER" && isDescendant(destinationItem, draggedItem))) 
            /* deny dragging a folder into one of its' descendant folders, causing a cyclic relationship */ 
  }

  useEffect(() => {
    const close = (() => {
      setContextMenu(null);
      setItemRename(null);
    })
    window.addEventListener("click", close);
    return (() => window.removeEventListener("click", close))
  }, [])

  function getItemListing(item) {
    return (
      <div
        draggable
        onClick={(e) => {
          e.stopPropagation();
          setContextMenu(null);
          onItemClick(item);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          makeContextMenu(e, item)
        }}
        onDragStart={() => setDraggedItem(item)}
        onDragEnd={() => setDraggedItem(null)}
        onDragOver={(e) => {e.preventDefault()}}
        onDrop={(e) => {
          e.preventDefault();
          if (canDropInto(item)) { 
            e.stopPropagation();
            onItemClick(item);
            onItemPatch(draggedItem, null, item.publicId);
          }
        }}
      >
        {(!itemRename || !itemRename.item || itemRename.item.publicId !== item.publicId) && (<> {item.name} </>)}
        {itemRename?.item?.publicId === item.publicId && (
          <div onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              type='text'
              value={itemRename.newName}
              onChange={(e) => setItemRename({ item: item, newName: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const newName = itemRename.newName.trim(); // trim spaces so that "  " or similar wouldn't be accepted
                  if (newName && newName != "") {
                    onItemPatch(itemRename.item, newName, null);
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

  function displayFolderContents(folderRoot, depth) {
    return(
      <div className="doc-list" style={{marginLeft: 10 + depth * 20}}>
        { (childrenIndex.get(folderRoot.publicId) ?? []).map(item => {
          if (item.type === "DOCUMENT") {
            return getItemListing(item);
          }
          else if (item.type === "FOLDER") {
            let folder = getItemListing(item);
            return (
              <>
                { folder }
                { item.isExpanded && displayFolderContents(item, depth + 1) }
              </>
            );
          }
        })}
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
          onItemDelete={onItemDelete}
          onItemRename={(item) => {setItemRename({item: item, newName: item.name})}}
        />
      }
      { (!childrenIndex.get(root.publicId) || 
          childrenIndex.get(root.publicId).length === 0) &&  
        <h2> Upload a file </h2> 
      }
      <div
        className="vertical-item-listing" 
        onClick={() => {
          onItemClick(root);
          setContextMenu(null);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onItemClick(root);
          if (draggedItem) onItemPatch(draggedItem, null, root.publicId);
        }}
      > 
        { displayFolderContents(root, 0) }
      </div>
    </>
  );
}

export default ItemList;

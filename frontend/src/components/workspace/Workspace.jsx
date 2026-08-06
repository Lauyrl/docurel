import "./css/Workspace.css";
import "../../css/common.css";
import ContextMenu from "./ContextMenu";
import PreviewOverlay from "./PreviewOverlay";
import PermissionsEdit from "./PermissionsEdit";
import { useEffect, useState } from "react";
import { useExplorer } from "../../context/ExplorerContext";
import { downloadDocumentRedirect } from "../../common";
import useExplorerOperations from "../../context/useExplorerOperations";
import MyFiles from "./pages/MyFiles";
import SharedWithMe from "./pages/SharedWithMe";
import Breadcrumbs from "../Breadcrumbs";

function Workspace({ currentPageIdx }) {
  const {childrenIndex} = useExplorer();
  const {selectItem, patchItem, deleteItem} = useExplorerOperations(currentPageIdx);

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
  
  function exitRename() {
    setItemRename(null);
  }

  useEffect(() => {
    window.addEventListener("click", exitRename);
    window.addEventListener("contextmenu", exitRename);
    return () => {
      window.removeEventListener("click", exitRename);
      window.removeEventListener("contextmenu", exitRename);
    }
  }, []);

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

  /**
   * Provides context menu logic, item renaming logic and item dragging logic
   * @param {*} item 
   * @param {*} displayItem 
   * @returns JSX representing the item as defined by displayItem, or the rename dialogue if the item is being renamed
   */  
  function renderItemListing(item, displayItem, selectOnSingleClick) {
    return (
      <div className="item-listing"
        onClick={selectOnSingleClick ? (e) => {
          e.stopPropagation();
          selectItem(item);
        } : undefined}
        onDoubleClick={!selectOnSingleClick ? (e) => {
          e.stopPropagation();
          selectItem(item);
        } : undefined}
        onContextMenu={(e) => {
          e.stopPropagation();
          e.preventDefault();
          makeContextMenu(e, item);
        }}

        draggable={!(itemRename?.item?.publicId === item.publicId)} // if item is being renamed dont let it be draggable
        onDragStart={() => setDraggedItem(item)}
        onDragEnd={() => setDraggedItem(null)}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (canDropInto(item)) {
            selectItem(item);
            patchItem(draggedItem, null, item.publicId);
          }
        }}
      >
        {itemRename?.item?.publicId !== item.publicId && displayItem(item) }
        {itemRename?.item?.publicId === item.publicId && (
          <div 
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
              e.stopPropagation(); 
              e.preventDefault();
            }}
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
      {
        contextMenu && contextMenu.item &&
        <ContextMenu 
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          onItemDownload={downloadDocumentRedirect}
          onItemDelete={deleteItem}
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
      <Breadcrumbs 
        currentPageIdx={currentPageIdx}
        renderItemListing={renderItemListing}
      />
      <div className="workspace">
        { 
          currentPageIdx == 0 && 
          <MyFiles 
            draggedItem={draggedItem} 
            renderItemListing={renderItemListing} 
          /> 
        }
        { 
          currentPageIdx == 1 && 
          <SharedWithMe
            draggedItem={draggedItem} 
            renderItemListing={renderItemListing} 
          /> 
        }
        <PreviewOverlay />
      </div>
    </>
  );
}

export default Workspace;

import { useEffect, useState } from "react";
import { API } from "../constants";
import ContextMenu from "./ContextMenu";

function ItemList({ root, childrenIndex, onItemClick, onItemDelete }) {
  const [contextMenu, setContextMenu] = useState({
    item: null,
    x: null,
    y: null
  });

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

  useEffect(() => {
    const close = (() => setContextMenu(null))
    window.addEventListener("click", close);
    return (() => window.removeEventListener("click", close))
  })

  function getItemListing(item) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          setContextMenu(null);
          onItemClick(item);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          makeContextMenu(e, item)
        }}
      >
        {item.name}
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
          downloadDocumentRedirect={downloadDocumentRedirect}
          onItemDelete={onItemDelete}
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
      > 
        { displayFolderContents(root, 0) }
      </div>
    </>
  );
}

export default ItemList;

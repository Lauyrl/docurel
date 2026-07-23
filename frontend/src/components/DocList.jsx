import { useEffect, useState } from "react";
import { API } from "../constants";
import ContextMenu from "./ContextMenu";

function DocList({ root, setRoot, onItemClick, onItemDelete }) {
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

  function downloadDocumentRedirect(filename) {
    /* window.location: Location object of the browser window, window.location.href: the full URL the browser is displaying */
    window.open(API + "document/" + filename + "/download");
  }

  useEffect(() => {
    const close = (() => setContextMenu(null))
    window.addEventListener("click", close);
    return (() => window.removeEventListener("click", close))
  })

  function displayFolder(rootFolder, depth) {
    return (
      <div
        className="vertical-item-listing" 
        onClick={() => {
          onItemClick(root);
          setContextMenu(null);
        }}
      >
        {contextMenu && 
          <ContextMenu 
            contextMenu={contextMenu}
            downloadDocumentRedirect={downloadDocumentRedirect}
            onItemDelete={onItemDelete}
          />
        }

        <div className="doc-list" style={{marginLeft: 10 + depth * 20}}>
          {rootFolder && rootFolder.children && ( 
            rootFolder.children.map((item) => {
              if (item.type === "document") {
                return (
                  <div>
                    <span 
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
                    </span>
                  </div>
                )
              }
              else if (item.type === "folder") {
                return (
                  <div>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          item.isExpanded = !item.isExpanded;
                          setContextMenu(null);
                          onItemClick(item);
                          setRoot({...root});
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          makeContextMenu(e, item)
                        }}
                      >
                        {item.name}
                      </div>
                      <div> { item.isExpanded && displayFolder(item, depth+1) } </div>
                  </div>
                );
              }
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {(!root || root.children?.length === 0) &&  <h2> Upload a file </h2>}
      { displayFolder(root, 0) }
    </>
  );
}

export default DocList;

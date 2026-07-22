function DocList({ root, setRoot, onDocClick, onDocDelete }) {
  
  function downloadDocumentRedirect(filename) {
    /* window.location: Location object of the browser window, window.location.href: the full URL the browser is displaying */
    window.location.href = "http://localhost:8080/document/" + filename + "/download";
  }

  function displayFolder(rootFolder, depth) {
    return (
      <>
        <div className="doc-list" style={{marginLeft: (10+ depth * 20) + "px"}}>
          {rootFolder && rootFolder.children && ( 
            rootFolder.children.map((item) => {
              if (item.type == "doc") {
                return (
                  <div>
                    <span onClick={() => onDocClick(item)}>
                      {item.name}{" "}
                    </span>
                    <button onClick={() => downloadDocumentRedirect(item.name)}>
                      Download
                    </button>{" "}
                    <button onClick={() => onDocDelete(item.name)}>
                      Delete
                    </button>
                  </div>
                )
              }
              else if (item.type == "folder") {
                return (
                  <div>
                      <div onClick={() => {
                        item.isExpanded = !item.isExpanded;
                        setRoot({...root});
                      }}>
                        {item.name}{" "}
                      </div>
                      <div> { item.isExpanded && displayFolder(item, depth+1) } </div>
                  </div>
                );
              }
            })
          )}
        </div>
      </>  
    );
  }

  return (
    <>
      {(!root || root.children.length === 0) &&  <h2> Upload a file </h2>}
      { displayFolder(root, 0) }
    </>
  );
}

export default DocList;

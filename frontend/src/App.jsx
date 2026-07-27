import { useEffect, useMemo, useState } from "react";
import "./App.css";
import ItemList from "./components/ItemList";
import SelectedItem from "./components/SelectedItem";
import FileUpload from "./components/FileUpload";
import FolderUpload from "./components/FolderUpload";
import { API } from "./constants";

function setUIState(item) {
  return { ...item, isExpanded: false }
}

function App() {
  // Creates a *state* variable with the initial value null, and a function to update that variable
  //   React stores the state of state variables across renders, a render happens whenever the state changes
  //    Render: a function call to the parent component (App() in this case)
  const [itemMap, setItemMap] = useState(new Map);
  const [rootId, setRootId] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const childrenIndex = useMemo(() => {
    const index = new Map();
    for (const item of itemMap.values()) {
      if (!index.has(item.publicParentId)) index.set(item.publicParentId, []);
      index.get(item.publicParentId).push(item);
    }
    return index;
  }, [itemMap]);

  // () contains the parameters
  // [] contains dependencies to 'watch'
  useEffect(() => {
    fetch(API + "document")
      .then((response) => response.json())
      .then(items => {
        let rootIdTemp = null;
        let itemMapTemp = new Map;
        items.forEach(item => {
          if (item.publicParentId === null) {
            rootIdTemp = item.publicId; 
            setRootId(item.publicId);
          }
          if (item.type === "FOLDER") item = setUIState(item);
          itemMapTemp.set(item.publicId, item)
        })
        setItemMap(itemMapTemp);
        setCurrentFolderId(rootIdTemp);
        setSelectedItemId(rootIdTemp);
      });
  }, []);

  function uploadDoc(file) {
    if (!file) return;

    const formData = new FormData();   // files sent to Spring as FormData
    formData.append("document", file); // name has to match the field name that Spring expects
    formData.append("publicParentId", currentFolderId);

    fetch(API + "document", {
      method: "POST",
      body: formData
    })
      .then((response) => response.json()) // response.json() doesnt return a json, but a 'Promise' that a json will be returned
      .then((item) => {
        setItemMap(current => new Map(current).set(item.publicId, item)); // implicit return
        });
    }

  function selectItem(item) {
    setSelectedItemId(item.publicId);
    if (item.type == "FOLDER") {
      const itemTemp = { ...item, isExpanded: !item.isExpanded }; 
      setItemMap(current => new Map(current).set(item.publicId, itemTemp)) // make new map with new entry to avoid mutating state
      setCurrentFolderId(item.publicId);
    }
  }

  function createFolder(foldername) {
    const formData = new FormData();
    formData.append("foldername", foldername);
    formData.append("publicParentId", currentFolderId);

    fetch(API + "folder", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((item) => { 
        if (item.type === 'FOLDER') item = setUIState(item);
        setItemMap(current => new Map(current).set(item.publicId, item))
      });
  }

  function deleteDescendants(next, rootFolder) {
    if (rootFolder.type !== "FOLDER") return;
    for (const child of (childrenIndex.get(rootFolder.publicId) ?? [])) {
      deleteDescendants(next, child);
      next.delete(child.publicId);
    }
  }

  function deleteItem(item) {
    let type = null;
    if      (item.type === 'DOCUMENT') type = 'document';
    else if (item.type === 'FOLDER') type = 'folder';
    fetch(API + type + "/" + item.publicId, { method: "DELETE" })
      .then(() => {
        let next = new Map(itemMap);
        if (item.type === "FOLDER") deleteDescendants(next, item);
        setItemMap(() => {
          next.delete(item.publicId);
          return next;
        });

        selectItem(item.publicParentId);
    });
  }

  return (
    <div className="app">
      <h1 className="logo"> Docurel </h1>

      <div className="ribbon">
        <FileUpload upload={uploadDoc} />
        <FolderUpload createFolder={createFolder} />
      </div>
      { currentFolderId && itemMap?.get(currentFolderId) && <div> Current Folder: { itemMap.get(currentFolderId).name } </div> }
      <br />

      <div className="workspace">
        { rootId && itemMap && childrenIndex && (<ItemList
          root={itemMap.get(rootId)}
          setRootId={setRootId}
          childrenIndex={childrenIndex}
          onItemClick={selectItem}
          onItemDelete={deleteItem}
        />) }
        { selectedItemId && itemMap && childrenIndex && (<SelectedItem 
          childrenIndex={childrenIndex} 
          selectedItem={itemMap.get(selectedItemId)} 
        />) }
      </div>
    </div>
  );
}

export default App;

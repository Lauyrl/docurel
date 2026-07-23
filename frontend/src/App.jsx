import { useEffect, useState } from "react";
import "./App.css";
import ItemList from "./components/ItemList";
import SelectedItem from "./components/SelectedItem";
import FileUpload from "./components/FileUpload";
import FolderUpload from "./components/FolderUpload";
import { API } from "./constants";

function initializeUIStates(rootJson) {
  if (!rootJson || !rootJson.children) return;
  rootJson.isExpanded = false

  rootJson.children.forEach(childJson => {
    if (childJson.type === "folder") {
      initializeUIStates(childJson);
    };
  })
}

function App() {
  // Creates a *state* variable with the initial value null, and a function to update that variable
  //   React stores the state of state variables across renders, a render happens whenever the state changes
  //    Render: a function call to the parent component (App() in this case)
  const [root, setRoot] = useState([]);
  const [currentFolder, setCurrentFolder] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  // () contains the parameters
  // [] contains dependencies to 'watch'
  useEffect(() => {
    fetch(API + "document")
      .then((response) => response.json())
      .then((json) => {
        initializeUIStates(json);
        setRoot(json);
        setCurrentFolder(json);
        setSelectedItem(json);
      });
  }, []);

  function uploadDoc(file) {
    if (!file) return;
    // files sent to Spring as FormData
    const formData = new FormData();
    // name has to match the field name that Spring expects
    formData.append("document", file);

    fetch(API + "document", {
      method: "POST",
      body: formData
    })
      .then((response) => response.json()) // response.json() doesnt return a json, but a 'Promise' that a json will be returned
      .then((json) => {
        if (json != null) setCurrentFolder({
          ...currentFolder,
          children: [...currentFolder.children, json]
        });
      });
  }

  function createFolder(foldername) {
    fetch(API + "folder/" + foldername, {method: "POST"})
    .then(response => response.json())
    .then((json) => setRoot({
      ...root,
      children: [...root.children, json]
    }));
  }

  function deleteItem(name) {

    fetch(API + "document/" + name, {method: "DELETE"})
    .then(response => response.json())
    .then(json => setRoot(json))
  }
  
  return (
    <div className="app">
      <h1 className="logo"> Docurel </h1>

      <div className="ribbon">
        <FileUpload upload={uploadDoc} />
        <FolderUpload createFolder={createFolder} />
      </div>
      <br />

      <div className="workspace">
        <ItemList root={root} setRoot={setRoot} onItemClick={setSelectedItem} onItemDelete={deleteItem} />
        <SelectedItem selectedItem={selectedItem} />
      </div>
    </div>
  );
}

export default App;

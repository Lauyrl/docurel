import { useEffect, useState } from "react";
import "./App.css";
import DocList from "./components/DocList";
import SelectDoc from "./components/DocSelect";
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
  const [selectedDoc, setSelectedDoc] = useState(null);

  // () contains the parameters
  // [] contains dependencies to 'watch'
  useEffect(() => {
    fetch(API + "document")
      .then((response) => response.json())
      .then((json) => {
        initializeUIStates(json);
        setRoot(json);
        setCurrentFolder(json);
        setSelectedDoc(json);
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
    fetch(API + "folder?foldername=" + foldername, {method: "POST"})
    .then(response => response.json())
    .then((json) => setRoot({
      ...root,
      children: [...root.children, json]
    }));
  }

  function deleteDoc(filename) {
    fetch(API + "document/" + filename, {method: "DELETE"})
    .then(response => response.json())
    .then(json => setRoot(json))
  }
  
  return (
    <div className="app">
      <h1> Docurel </h1>

      <div className="ribbon">
        <FileUpload upload={uploadDoc} />
        <FolderUpload createFolder={createFolder} />
      </div>
      <br />

      <div className="workspace">
        <DocList root={root} setRoot={setRoot} onDocClick={setSelectedDoc} onDocDelete={deleteDoc} />
        <SelectDoc selectedDoc={selectedDoc} />
      </div>
    </div>
  );
}

export default App;

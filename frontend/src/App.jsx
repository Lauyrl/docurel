import { useEffect, useState } from "react";
import "./App.css";
import DocumentList from "./components/DocumentList";
import SelectDoc from "./components/DocSelect";
import FileUpload from "./components/FileUpload";

function App() {
  // Creates a *state* variable with the initial value null, and a function to update that variable
  //   React stores the state of state variables across renders, a render happens whenever the state changes
  //    Render: a function call to the parent component (App() in this case)
  const [documents, setDocuments] = useState([]);

  // () contains the parameters
  // [] contains dependencies to 'watch'
  useEffect(() => {
    fetch("http://localhost:8080/document")
      .then((response) => response.json())
      .then((json) => setDocuments(json));
  }, []);

  function uploadDoc(file) {
    if (!file) return;
    // files sent to Spring as FormData
    const formData = new FormData();
    // name has to match the field name that Spring expects
    formData.append("document", file);

    fetch("http://localhost:8080/document", {
      method: "POST",
      body: formData
    })
      .then((response) => response.json()) // response.json() doesnt return a json, but a 'Promise' that a json will be returned
      .then((json) => {
        if (json != null) setDocuments((current) => [...current, json]);
      });
  }

  const [selectedDoc, setSelectedDoc] = useState(null);

  function deleteDoc(filename) {
    fetch("http://localhost:8080/document/" + filename, {method: "DELETE"})
    .then(response => response.json())
    .then(json => setDocuments(json))
  }


  function createFolder(foldername) {
    fetch("http://localhost:8080/folder?foldername=" + foldername, {method: "POST"})
  }
  
  const [foldernameToCreate, setFoldernameToCreate] = useState("")
  
  return (
    <>
      <h1> Docurel </h1>

      <FileUpload upload={uploadDoc} />

      <DocumentList documents={documents} onDocClick={setSelectedDoc} onDocDelete={deleteDoc} />

      <SelectDoc selectedDoc={selectedDoc} />

      <div>
        <input 
          type="text"
          onChange={(e) => {setFoldernameToCreate(e.target.value)}}
        />
        <button onClick={() => {createFolder(foldernameToCreate)}}>Create File</button>
      </div>
    </>
  );
}

export default App;

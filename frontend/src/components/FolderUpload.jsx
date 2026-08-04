import "./css/FolderUpload.css"
import { useState } from "react";
import { useExplorer } from "../ExplorerContext";

function FolderUpload() {
  const {createFolder} = useExplorer();

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [foldernameToCreate, setFoldernameToCreate] = useState("");
  
  function uploadFolderToCreate() {
    if (!foldernameToCreate || foldernameToCreate === "") return;
    createFolder(foldernameToCreate);
    setFoldernameToCreate("");
  }

  return (
    <div>
      {
        creatingFolder &&
        <div className="overlay" onClick={(e) => {
          e.stopPropagation();
          setCreatingFolder(false);
        }}>
          <div className="create-folder-modal" onClick={(e) => {e.stopPropagation()}}>
            <div> Enter Folder name </div>
            <input
              type="text"
              value={foldernameToCreate}
              placeholder="Enter Folder name here"
              onChange={(e) => setFoldernameToCreate(e.target.value.trim())}
              onKeyDown={(e) => {
                if (e.key === "Enter") uploadFolderToCreate();
              }}
            />
            <div className="modal-buttons">
              <button onClick={() => {setCreatingFolder(false)}}> Cancel </button>
              <button onClick={() => {
                uploadFolderToCreate();
                setCreatingFolder(false);
              }}> 
                Confirm 
              </button>
            </div>
          </div>
        </div>
      }
      <button 
        className="create-folder-button"
        onClick={(e) => {
          e.stopPropagation();
          setCreatingFolder(true);
        }}
      >
        Create Folder
      </button>
    </div>
  );
}

export default FolderUpload;

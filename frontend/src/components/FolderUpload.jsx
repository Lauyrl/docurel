import { useState } from "react";
import { useExplorer } from "../ExplorerContext";

function FolderUpload() {
  const {createFolder} = useExplorer();

  const [foldernameToCreate, setFoldernameToCreate] = useState("");

  function uploadFolderToCreate() {
    if (!foldernameToCreate || foldernameToCreate === "") return;
    createFolder(foldernameToCreate);
    setFoldernameToCreate("");
  }

  return (
    <div>
      <input
        type="text"
        value={foldernameToCreate}
        placeholder="Enter Folder name here"
        onChange={(e) => setFoldernameToCreate(e.target.value.trim())}
        onKeyDown={(e) => {
          if (e.key === "Enter") uploadFolderToCreate();
        }}
      />
      <button onClick={uploadFolderToCreate}>
        Create Folder
      </button>
    </div>
  );
}

export default FolderUpload;

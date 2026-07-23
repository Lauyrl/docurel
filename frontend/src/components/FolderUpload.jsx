import { useState } from "react";

function FolderUpload({ createFolder }) {
  const [foldernameToCreate, setFoldernameToCreate] = useState("");

  return (
    <div>
      <input
        type="text"
        value={foldernameToCreate}
        placeholder="Enter Folder name here"
        onChange={(e) => setFoldernameToCreate(e.target.value)}
      />
      <button
        onClick={() => {
          createFolder(foldernameToCreate);
          setFoldernameToCreate("");
        }}
      >
        Create Folder
      </button>
    </div>
  );
}

export default FolderUpload;

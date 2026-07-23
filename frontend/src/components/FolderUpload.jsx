import { useState } from "react";

function FolderUpload({ createFolder }) {
  const [foldernameToCreate, setFoldernameToCreate] = useState("");

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Folder name here"
        onChange={(e) => {
          setFoldernameToCreate(e.target.value);
        }}
      />
      <button
        onClick={() => {createFolder(foldernameToCreate);}}
      >
        Create File
      </button>
    </div>
  );
}

export default FolderUpload;

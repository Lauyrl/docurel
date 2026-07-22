import { useState } from "react";

function FolderUpload({ createFolder }) {
  const [foldernameToCreate, setFoldernameToCreate] = useState("");

  return (
    <>
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
    </>
  );
}

export default FolderUpload;

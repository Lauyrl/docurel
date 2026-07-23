import { useState } from "react";

function FileUpload({ upload }) {
  const [uploadedFile, setUploadedFile] = useState(null);

  return (
    <div>
      <input
        /* creates an <input type = "file"> element with default value = "No file selected", creates a built in input UI */
        type="file"
        /* e: the event object, is created when <input type = "file"> changes 
           e.target: HTML element that created the event (<input type = "file">)
           e.target.files: access the file property of <input type = "file">
        */
        onChange={(e) => setUploadedFile(e.target.files[0])}
      />
      <button
        /*  onClick is a component parameter, and needs to evaluate to a function, not a value */
        onClick={() => upload(uploadedFile)}
      >
        Upload
      </button>
    </div>
  );
}

export default FileUpload;

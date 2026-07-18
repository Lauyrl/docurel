import { useState } from "react";

function FileUpload({ upload }) {
  const [file, setFile] = useState(null); // Stores file

  return (
    <>
      <input
        // creates an <input type = "file"> element with default value = "No file selected", creates a built in input UI
        type="file"
        /* e: the event object, is created when <input type = "file"> changes 
           e.target: HTML element that created the event (<input type = "file">)
           e.target.files: access the file property of <input type = "file">
        */
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={() => upload(file)}>Upload</button>{" "}
      {/* 
        onClick is a component parameter, and needs to evaluate to a function, not a value 
        (//parameters) => {//body} evaluates to a function, upload(file) is just a result
      */}
    </>
  );
}

export default FileUpload;

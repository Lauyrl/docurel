import { FileUp } from "lucide-react";
import useExplorerOperations from "../context/useExplorerOperations";
import "./css/ribbon.css"
import { useRef } from "react";
import { useExplorer } from "../context/ExplorerContext";

function FileUpload({ currentPageIdx }) {
  const {currentFolder} = useExplorer();
  const {uploadDocument} = useExplorerOperations(currentPageIdx);
  const fileInputRef = useRef(null);

  return (
    <div>
      <input
        ref={fileInputRef} // lets fileInputRef.current to reference this
        type="file" // creates an <input type = "file"> element with default value = "No file selected", creates a built in input UI
        style={{ display: "none" }} // hide the element
        /* e: the event object, is created when <input type = "file"> changes 
           e.target: HTML element that created the event (<input type = "file">)
           e.target.files: access the file property of <input type = "file">
        */
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) uploadDocument(file);
          e.target.value = ""; // reset this because e.target.files is immutable, resetting lets onChange trigger more reliably later
        }}
      />

      <button
        className="ribbon-button"
        disabled={!currentFolder}
        onClick={() => fileInputRef.current.click()} // since the <input/> is hidden, simulate the click through the Ref
      >
        <FileUp/>
        {"Upload File"}
      </button>
    </div>
  );
}

export default FileUpload;

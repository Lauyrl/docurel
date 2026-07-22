import { useEffect, useState } from "react";
import Preview from "./Preview";

function SelectDoc({ selectedDoc }) {
  const [preview, setPreview] = useState({
    filename: "",
    url: null
  });

  useEffect(() => {
    if (!selectedDoc) return;

    let url = null;
    fetch("http://localhost:8080/document/" + selectedDoc.name)
      .then((response) => response.blob())
      .then((blob) => {
        url = URL.createObjectURL(blob); 
        setPreview({filename: selectedDoc.name, url: url}); 
      });

    // a return () => {} in a useEffect() is a special *cleanup function* that doesnt run at the end of the current effect, but at the beginning of the next
    return () => {
      URL.revokeObjectURL(url);
    }
  }, [selectedDoc]);

  /* preview.filename == selectedDoc.filename avoid trying to render an older selectedDoc's URL with an element meant for the current selectedDoc's contentType 
     can happen because selectedDoc changes before the new blob fetch finishes */
  return <> {(selectedDoc && preview.name == selectedDoc.name) && <Preview blobURL = {preview.url} contentType = {selectedDoc.contentType}/>} </>;
}

export default SelectDoc;

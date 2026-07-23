import { useEffect, useState } from "react";
import { API } from "../constants";
import Preview from "./Preview";

function SelectDoc({ selectedDoc }) {
  const [preview, setPreview] = useState({
    name: "",
    url: null
  });

  useEffect(() => {
    if (!selectedDoc || selectedDoc.type === "folder") return;

    let url = null;
    fetch(API + "document/" + selectedDoc.name)
      .then((response) => response.blob())
      .then((blob) => {
        url = URL.createObjectURL(blob); 
        setPreview({
          name: selectedDoc.name, 
          url: url}
        ); 
      });

    // a 'return () => {}' in a useEffect() is a special *cleanup function* that doesnt run at the end of the current effect, but at the beginning of the next
    return () => URL.revokeObjectURL(url);
  }, [selectedDoc]);
  
  if (!selectedDoc) return null;

  if (selectedDoc.type === "doc" && preview.name === selectedDoc.name) {
    return (
      <div className="preview">
        <Preview blobURL = {preview.url} contentType = {selectedDoc.contentType}/>
      </div>
    );
  }
  else if (selectedDoc.type === "folder") {
    // result of .map() needs to be returned
    return (
      <div className="item-listing">
        { selectedDoc.children.map(item => (<div> {item.name} </div>)) }
      </div>
    )
  }
}

export default SelectDoc;

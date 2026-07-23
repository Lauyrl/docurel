import { useEffect, useState } from "react";
import { API } from "../constants";
import Preview from "./Preview";

function SelectedItem({ selectedItem }) {
  const [preview, setPreview] = useState({
    name: "",
    url: null
  });

  useEffect(() => {
    if (!selectedItem || selectedItem.type === "folder") return;

    let url = null;
    fetch(API + "document/" + selectedItem.name)
      .then((response) => response.blob())
      .then((blob) => {
        url = URL.createObjectURL(blob); 
        setPreview({
          name: selectedItem.name, 
          url: url
        }); 
      });

    // a 'return () => {}' in a useEffect() is a special *cleanup function* that doesnt run at the end of the current effect, but at the beginning of the next
    return () => URL.revokeObjectURL(url);
  }, [selectedItem]);
  
  if (!selectedItem) return null;

  /* preview.filename === selectedItem.filename: avoid trying to render an older selectedItem's URL with an element meant for the current selectedItem's contentType,
  can happen because selectedItem changes before the new blob fetch finishes */
  if (selectedItem.type === "document" && preview.name === selectedItem.name) {
    return (
      <div className="preview">
        <Preview blobURL = {preview.url} contentType = {selectedItem.contentType}/>
      </div>
    );
  }
  else if (selectedItem.type === "folder") {
    // result of .map() needs to be returned
    return (
      <div className="grid-item-listing">
        { selectedItem.children.map(item => (<div> {item.name} </div>)) }
      </div>
    )
  }
}

export default SelectedItem;

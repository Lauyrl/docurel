import { useEffect, useState } from "react";
import { API } from "../constants";
import Preview from "./Preview";

function SelectedItem({ childrenIndex, selectedItem }) {
  const [preview, setPreview] = useState({
    name: "",
    url: null
  });

  // make document preview
  useEffect(() => {
    if (!selectedItem || selectedItem.type === "FOLDER") return;

    let url = null;
    fetch(API + "document/" + selectedItem.publicId)
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

  /* preview.name === selectedItem.name: avoid trying to render an older selectedItem's URL with an element meant for the current selectedItem's contentType,
  can happen because selectedItem changes before the new blob fetch finishes */
  if (selectedItem.type === "DOCUMENT" && preview?.name === selectedItem.name) {
    return (
      <div className="preview">
        <Preview blobURL = {preview.url} contentType = {selectedItem.contentType}/>
      </div>
    );
  }
  else if (selectedItem.type === "FOLDER") {
    // result of .map() needs to be returned
    return (
      <div className="grid-item-listing">
        { (childrenIndex.get(selectedItem.publicId) ?? []).map(item => (<div> {item.name} </div>)) }
      </div>
    )
  }
}

export default SelectedItem;

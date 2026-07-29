import "./css/PreviewOverlay.css";
import { useEffect, useState } from "react";
import { useExplorer } from "../ExplorerContext";
import { API } from "../constants";
import Preview from "./Preview";

function PreviewOverlay() {
  const {previewItem, setPreviewItemId} = useExplorer(); 

  const [preview, setPreview] = useState({
    publicId: null,
    url: null,
  });

  // make document preview
  useEffect(() => {
    if (!previewItem) return;

    let url = null;
    fetch(API + "document/" + previewItem.publicId)
      .then((response) => response.blob())
      .then((blob) => {
        url = URL.createObjectURL(blob);
        setPreview({
          publicId: previewItem.publicId,
          url: url,
        });
      });
    // a 'return () => {}' in a useEffect() is a special *cleanup function* that doesnt run at the end of the current effect, but at the beginning of the next
    return () => URL.revokeObjectURL(url);
  }, [previewItem]);

  function closePreview() {
    setPreviewItemId(null);
    setPreview({ publicId: null, url: null });
  }
  
  /* previewItem.name === preview.name: avoid trying to render an older previewItem's URL with an element meant for the current previewItem's contentType,
  can happen because previewItem changes before the new blob fetch finishes */
  return (
    <>
      {previewItem?.publicId && previewItem?.publicId === preview.publicId && (  // if previewItem is null, previewItem?.publicId returns undefined, undefined !== null
        <div
          className="preview-overlay" /* includes gray background */
          onClick={closePreview}
        >
          <div className="preview-object">
            <div className="preview-header">
              <button className="preview-close" onClick={closePreview}> ✕ </button>
              <span className="preview-title"> {previewItem.name} </span>
            </div>

            <div
              className="preview-modal" /* shows the contents */
              onClick={(e) => e.stopPropagation()}
            >
              <Preview
                blobURL={preview.url}
                contentType={previewItem.contentType}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PreviewOverlay;

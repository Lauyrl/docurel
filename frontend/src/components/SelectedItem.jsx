import "./css/SelectedItem.css";
import { useEffect, useState } from "react";
import { API } from "../constants";
import Preview from "./Preview";

function SelectedItem({childrenIndex, currentFolder, previewItem, setPreviewItemId}) {
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

  if (!currentFolder) return null;

  const currentFolderChildren = childrenIndex.get(currentFolder.publicId);
  /* preview.name === selectedItem.name: avoid trying to render an older selectedItem's URL with an element meant for the current selectedItem's contentType,
  can happen because selectedItem changes before the new blob fetch finishes */
  return (
    <div className="selected-item">
      {currentFolderChildren == null && <> This folder is empty. </>}
      <div className="folder-grid-item-listing">
        {currentFolderChildren &&
          currentFolderChildren.map((item) => (
            <div>
              <div> {item.type === "FOLDER" ? "📁" : "📄"} </div>
              <div> {item.name} </div>
            </div>
          ))}
      </div>
      {previewItem && preview.publicId === previewItem.publicId && (
        <div
          className="preview-overlay" /* includes gray background */
          onClick={() => {
            setPreviewItemId(null);
            setPreview({ publicId: null, url: null });
          }}
        >
          <div className="preview-object">
            <div className="preview-header">
              <button className="preview-close" onClick={() => {
                setPreviewItemId(null);
                setPreview({ publicId: null, url: null });
              }}> ✕ </button>
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
    </div>
  );
}

export default SelectedItem;

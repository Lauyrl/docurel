import { useEffect, useState } from "react";

function SelectDoc({ selectedDoc }) {
  const [blobURL, setBlobURL] = useState(null);
  useEffect(() => {
    if (selectedDoc) {
      if (blobURL) URL.revokeObjectURL(blobURL);
      
      fetch("http://localhost:8080/document/" + selectedDoc.filename)
        .then((response) => response.blob())
        .then((blob) => setBlobURL(URL.createObjectURL(blob)));
    }
  }, [selectedDoc]);

  // Not a state variable since it already depends on a state
  let preview = null;
  if (blobURL) {
    switch (selectedDoc.contentType) {
      case "text/plain":
      case "application/pdf":
        preview = <iframe src={blobURL} />;
        break;

      case "image/jpeg":
      case "image/png":
      case "image/gif":
      case "image/webp":
        preview = <img src={blobURL} width="600" height="400" />;
        break;

      case "video/mp4":
      case "video/webm":
        preview = (
          <video controls width="600">
            <source src={blobURL} type={selectedDoc.contentType} />{" "}
          </video>
        );
        break;

      case "audio/wav":
      case "audio/mp3":
        preview = (
          <audio controls>
            <source src={blobURL} type={selectedDoc.contentType} />{" "}
          </audio>
        );
        break;

      default:
        preview = <div>Preview not available</div>;
    }
  }
  return <>{preview}</>;
}

export default SelectDoc;

function Preview({blobURL, contentType}) {
  let preview = null;
  if (blobURL) {
    switch (contentType) {
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
            <source src={blobURL} type={contentType} />{" "}
          </video>
        );
        break;

      case "audio/wav":
      case "audio/mp3":
        preview = (
          <audio controls>
            <source src={blobURL} type={contentType} />{" "}
          </audio>
        );
        break;

      default:
        preview = <div>Preview not available</div>;
    }
  }
  return <>{preview}</>
}

export default Preview;

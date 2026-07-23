function Preview({blobURL, contentType}) {
  let preview = null;
  if (blobURL) {
    switch (contentType) {
      case "text/plain":
      case "application/pdf":
        preview = <iframe width={1400} height={600} src={blobURL} />;
        break;

      case "image/jpeg":
      case "image/png":
      case "image/gif":
      case "image/webp":
        preview = <img width={1400} src={blobURL} />;
        break;

      case "video/mp4":
      case "video/webm":
        preview = (
          <video controls width={1400}>
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

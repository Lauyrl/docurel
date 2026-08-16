function Preview({ blobURL, contentType }) {
  if (!blobURL) return;

  switch (contentType) {
    case "text/plain":
    case "application/pdf":
      return <iframe style={{backgroundColor: "black"}} width={1400} height={600} src={blobURL} />;

    case "image/jpeg":
    case "image/png":
    case "image/gif":
    case "image/webp":
      return <img src={blobURL} />;

    case "video/mp4":
    case "video/webm":
      return (
        <video controls width={1400}>
          <source src={blobURL} type={contentType} />
        </video>
      );

    case "audio/wav":
    case "audio/mp3":
       return (
        <audio controls>
          <source src={blobURL} type={contentType} />
        </audio>
      );

    default:
      return <div>Preview not available</div>;
  }
}

export default Preview;

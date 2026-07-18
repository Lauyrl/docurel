function DocumentList({ documents, onDocClick, onDocDelete }) {
  function downloadDocumentRedirect(filename) {
    window.location.href =
      "http://localhost:8080/document/" + filename + "/download";
  }

  return (
    <>
      {documents.length === 0 && <h2> Upload a file </h2>}
      {
        /* .map renders a collection */
        /* window.location: Location object of the browser window, window.location.href: the full URL the browser is displaying */
        documents.map((document) => (
          <div>
            <span onClick={() => onDocClick(document)}>
              {document.filename}{" "}
            </span>
            <button onClick={() => downloadDocumentRedirect(document.filename)}>
              Download
            </button>{" "}
            <button onClick={() => onDocDelete(document.filename)}>
              Delete
            </button>
          </div>
        ))
      }
    </>
  );
}

export default DocumentList;

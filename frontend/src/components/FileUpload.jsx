function FileUpload({ upload }) {
  return (
    <div>
      <input
        /* creates an <input type = "file"> element with default value = "No file selected", creates a built in input UI */
        type="file"
        /* e: the event object, is created when <input type = "file"> changes 
           e.target: HTML element that created the event (<input type = "file">)
           e.target.files: access the file property of <input type = "file">
        */
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) upload(file);
        }}
      />
    </div>
  );
}

export default FileUpload;

import "./css/FolderContentsViewSkeleton.css"

function FolderContentsViewSkeleton({ count }) {
  return (
    <div className="folder-grid-item-listing skeleton-grid">
      {
        Array.from({ length: count }, (_, i) => (
            <div className="folder-grid-skeleton-item" key={i}>
            <div className="folder-grid-skeleton-icon" />
            <div className="folder-grid-skeleton-name" />
            </div>
        ))
    }
    </div>
  );
}

export default FolderContentsViewSkeleton;

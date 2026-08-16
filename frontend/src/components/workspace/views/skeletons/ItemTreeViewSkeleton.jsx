import "./css/ItemTreeViewSkeleton.css"

function ItemTreeViewSkeleton() {
  return (
    <div className="tree-skeleton">
      <div className="tree-skeleton-row">
        <div className="tree-skeleton-icon" />
        <div className="tree-skeleton-name width-1" />
      </div>

      <div className="tree-skeleton-row">
        <div className="tree-skeleton-icon" />
        <div className="tree-skeleton-name width-2" />
      </div>

      <div className="tree-skeleton-row">
        <div className="tree-skeleton-icon" />
        <div className="tree-skeleton-name width-3" />
      </div>

      <div className="tree-skeleton-row depth-1">
        <div className="tree-skeleton-arrow" />
        <div className="tree-skeleton-folder" />
        <div className="tree-skeleton-name width-2" />
      </div>

      <div className="tree-skeleton-row depth-1">
        <div className="tree-skeleton-arrow" />
        <div className="tree-skeleton-folder" />
        <div className="tree-skeleton-name width-4" />
      </div>

      <div className="tree-skeleton-row depth-2">
        <div className="tree-skeleton-arrow" />
        <div className="tree-skeleton-folder" />
        <div className="tree-skeleton-name width-1" />
      </div>

      <div className="tree-skeleton-row">
        <div className="tree-skeleton-icon" />
        <div className="tree-skeleton-name width-2" />
      </div>

      <div className="tree-skeleton-row">
        <div className="tree-skeleton-icon" />
        <div className="tree-skeleton-name width-3" />
      </div>

      <div className="tree-skeleton-row depth-1">
        <div className="tree-skeleton-arrow" />
        <div className="tree-skeleton-folder" />
        <div className="tree-skeleton-name width-2" />
      </div>

      <div className="tree-skeleton-row depth-1">
        <div className="tree-skeleton-arrow" />
        <div className="tree-skeleton-folder" />
        <div className="tree-skeleton-name width-4" />
      </div>
    </div>
  );
}

export default ItemTreeViewSkeleton;

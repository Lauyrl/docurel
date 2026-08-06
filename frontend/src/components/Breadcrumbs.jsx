import "./css/Breadcrumbs.css"
import { useExplorer } from "../context/ExplorerContext";
import useExplorerOperations from "../context/useExplorerOperations";

function Breadcrumbs({ currentPageIdx, renderItemListing }) {
    const {itemMap, currentFolder} = useExplorer();
    const {selectItem} = useExplorerOperations(currentPageIdx)
    
    function displayItem(item) {
      return (<> {item.name} </>);
    }

    let path = [];
    let folder = currentFolder;
    while (folder) {
      path.push(folder);
      folder = itemMap.get(folder.publicParentId);
    }
    path = path.reverse();
    return (
      <div className="breadcrumbs">
        { currentPageIdx === 0 && "My Files: " }
        { currentPageIdx === 1 && "Shared with me: " }
        { 
          path.map((item, i) => (
            <span key={item.publicId}>
              {(i > 0) && " > "}
              <span className="breadcrumb"> {renderItemListing(item, displayItem, true)} </span> 
            </span>
          )) 
        }
      </div>
    );
}

export default Breadcrumbs;

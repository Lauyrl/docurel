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
    while (folder?.publicParentId) {
      path.push(folder);
      folder = itemMap.get(folder.publicParentId);
    }
    path = path.reverse();
    return (
      <div className="breadcrumbs">
        <span className="breadcrumb"> 
          { currentPageIdx === 0 && "My Files" }
          { currentPageIdx === 1 && "Shared with me" }
        </span>
        { 
          path.map((item) => (
            <span key={item.publicId}>
              {" > "}
              <span className="breadcrumb"> {renderItemListing(item, displayItem, true, false)} </span> 
            </span>
          )) 
        }
      </div>
    );
}

export default Breadcrumbs;

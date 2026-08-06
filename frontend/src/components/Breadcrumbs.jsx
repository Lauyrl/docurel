import "./css/Breadcrumbs.css"
import { useExplorer } from "../context/ExplorerContext";
import useExplorerOperations from "../context/useExplorerOperations";

function Breadcrumbs({ currentPageIdx }) {
    const {itemMap, currentFolder} = useExplorer();
    const {selectItem} = useExplorerOperations(currentPageIdx)
    
    if (!currentFolder) return null;
    
    let path = [];
    let folder = currentFolder;
    while (folder) {
      path.push(folder);
      folder = itemMap.get(folder.publicParentId);
    }
    path = path.reverse();
    return(
      <div className="breadcrumb">
        { "Path: " }
        { 
          path.map((item, i) => (
            <span key={item.publicId} onClick={() => selectItem(item)}>
              {(i > 0) && " > "}
              <span className="breadcrumbs"> {item.name} </span> 
            </span>
          )) 
        }
      </div>
    );
}

export default Breadcrumbs;

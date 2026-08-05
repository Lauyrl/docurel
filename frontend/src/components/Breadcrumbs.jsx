import "./css/Breadcrumbs.css"
import { useExplorer } from "../context/ExplorerContext";

function Breadcrumbs() {
    const {currentFolder, getItem, selectItem} = useExplorer();
    if (!currentFolder) return null;
    
    let path = [];
    let folder = currentFolder;
    while (folder) {
      path.push(folder);
      folder = getItem(folder.publicParentId);
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

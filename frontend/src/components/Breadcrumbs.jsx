import "./css/Breadcrumbs.css"
import "./workspace/css/Workspace.css"
import { useExplorer } from "../context/ExplorerContext";
import ItemNavigation from "./ItemNavigation";

function Breadcrumbs({ currentPageIdx, renderItemListing }) {
    const {itemNavigationStackBackward} = useExplorer();

    function displayItem(item) {
      return (<> {item.name} </>);
    }

    return (
      <div className="mini-ribbon">
        <ItemNavigation currentPageIdx={currentPageIdx}/> 
        <div className="breadcrumbs">
          { currentPageIdx === 0 && "My Files" }
          { currentPageIdx === 1 && "Shared with me" }
          { 
            itemNavigationStackBackward.map((item, i) => {
              if (currentPageIdx === 0 && i === 0) return null; // if on MyFiles page, dont display user root
              return (
                <span style={{display: "flex", alignItems: "center", gap: "4px"}}>
                  {" > "} 
                  {renderItemListing(item, displayItem, true, false)} 
                </span>
              );
            }) 
          }
        </div>
      </div>
    );
}

export default Breadcrumbs;

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
          <div style={{paddingLeft: "15px", display: "flex", alignItems: "center"}}>
            {
              itemNavigationStackBackward.map((item) => {
                if (item.userRoot) return;
                return (
                  <span style={{display: "flex", alignItems: "center"}}>
                    {">"} {renderItemListing(item, displayItem, true, false)} 
                  </span>
                );
              })
            } 
          </div>
        </div>
      </div>
    );
}

export default Breadcrumbs;

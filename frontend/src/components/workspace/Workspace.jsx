import "./css/Workspace.css";
import "../../css/common.css";
import MyFiles from "./MyFiles";
import SharedWithMe from "./SharedWithMe";
import Recents from "./Recents";

function Workspace({ currentPageIdx, draggedItem, renderItemListing }) {
  return (
    <>
      <div className="workspace">
        { 
          currentPageIdx == 0 && 
          <MyFiles 
            draggedItem={draggedItem} 
            renderItemListing={renderItemListing} 
          /> 
        }
        { 
          currentPageIdx == 1 && 
          <SharedWithMe
            draggedItem={draggedItem} 
            renderItemListing={renderItemListing} 
          /> 
        }
        { 
          currentPageIdx == 2 && 
          <Recents renderItemListing={renderItemListing} /> 
        }
      </div>
    </>
  );
}

export default Workspace;

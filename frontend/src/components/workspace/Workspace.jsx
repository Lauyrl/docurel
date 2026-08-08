import "./css/Workspace.css";
import "../../css/common.css";
import PreviewOverlay from "./PreviewOverlay";
import MyFiles from "./pages/MyFiles";
import SharedWithMe from "./pages/SharedWithMe";

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
        <PreviewOverlay />
      </div>
    </>
  );
}

export default Workspace;

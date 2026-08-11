import "./css/PagesPanel.css";
import { Clock, House, Star, Users } from "lucide-react";

function PagesPanel({ currentPageIdx, setCurrentPageIdx }) {
  function button(icon, page, label) {
    return (
      <button 
        className="page-button" onClick={() => {setCurrentPageIdx(page)}}
        style={{backgroundColor: (currentPageIdx === page) ? "#e7772d" : undefined}}
      >
        { icon } { label }
      </button>
    );
  }

  return (
    <div className="pages-panel">
      <div className="logo"> Docurel </div>
      { button(<House size={22} />, 0, "My Files") }
      { button(<Users size={22} />, 1, "Shared with me") }
      { button(<Clock size={22} />, 2, "Recents") }
      { button(<Star  size={22} />, 3, "Starred") }
    </div>
  )
}

export default PagesPanel;

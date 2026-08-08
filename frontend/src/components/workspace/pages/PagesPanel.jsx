import { House, Users } from "lucide-react";
import "./css/PagesPanel.css";

function PagesPanel({ setCurrentPageIdx }) {
  return (
    <div className="pages-panel">
      <div className="logo"> Docurel </div>	
      <button className="page-button" onClick={() => setCurrentPageIdx(0)}>
        <House size={22}/>
        {"My Files"}
      </button>
      <button className="page-button" onClick={() => setCurrentPageIdx(1)}>
        <Users size={22}/>
        Shared with me
      </button>
    </div>
  )
}

export default PagesPanel;

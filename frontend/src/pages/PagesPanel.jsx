import "./css/PagesPanel.css";

function PagesPanel({ setCurrentPageIdx }) {
  return (
    <div className="pages-panel">
      <div className="logo"> Docurel </div>	
      <button className="page-button" onClick={() => setCurrentPageIdx(0)}>
        My Files
      </button>
      <button className="page-button" onClick={() => setCurrentPageIdx(1)}>
        Shared with me
      </button>
    </div>
  )
}

export default PagesPanel;

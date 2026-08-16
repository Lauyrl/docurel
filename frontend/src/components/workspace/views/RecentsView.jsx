import "./css/RecentsView.css";
import "./css/FolderContentsView.css";
import { File, Folder, Star } from "lucide-react";
import useExplorerOperations from "../../../context/useExplorerOperations";

function RecentsView({ recents, renderItemListing, loading }) {
  const { filterAndSortItemsList } = useExplorerOperations(2)

  function displayItem(item) {
    return (
      <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
        {item.type === "FOLDER" ? <Folder fill="grey" size={60} /> : <File fill="grey" size={60} />}
        <div className="item-name"> 
          <span>{item.name}</span> 
          {item.starred && <Star fill="rgb(251, 205, 121)"/>} 
        </div>
        <div className="last-opened"> {new Date(item.lastOpened).toLocaleDateString()} </div>
      </div>
    );
  }

  const week = new Date();
  week.setDate(week.getDate() - 7);

  const month = new Date();
  month.setDate(month.getDate() - 31);

  const sixMonths = new Date();
  sixMonths.setDate(sixMonths.getDate() - 180);

  function recencyBlock(label, filterCallback) {
    return (
      <>
        <div className="recents-section-header">
          <span>{label}</span>
        </div>
        <div className="recents-grid-item-listing">
          {
            filtered
              .filter(filterCallback)
              .map((item) => renderItemListing(item, displayItem, true, false))
          }
        </div>
      </>
    );
  }

  const filtered = filterAndSortItemsList(recents);

  return (
    <div className="recents">
      {filtered.length === 0 && <> You have no recent items. </>}
      {
        filtered.length > 0 && 
        <>
          {recencyBlock("Last week", ((item) => (new Date(item.lastOpened) >= week)))}
          {recencyBlock("Last month", ((item) => (new Date(item.lastOpened) < week && new Date(item.lastOpened) >= month)))}
          {recencyBlock("Last few months", ((item) => (new Date(item.lastOpened) < month && new Date(item.lastOpened) >= sixMonths)))}
          {recencyBlock("Older", ((item) => (new Date(item.lastOpened) < sixMonths)))}
        </>
      }
    </div>
  );
}

export default RecentsView;

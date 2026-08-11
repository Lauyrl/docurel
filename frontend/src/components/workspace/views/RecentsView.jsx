import "./css/RecentsView.css";
import "./css/FolderContentsView.css";
import { File, Folder, Star } from "lucide-react";
import useExplorerOperations from "../../../context/useExplorerOperations";

function RecentsView({ recents, renderItemListing }) {
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

  const filtered = filterAndSortItemsList(recents);
  return (
    <div className="recents">
      {filtered.length === 0 && <> You have no recent items. </>}
      {
        filtered.length > 0 && 
        <>
          <div className="recents-section-header">
            <span>Last week</span>
          </div>
          <div className="recents-grid-item-listing">
            {
              filtered
                .filter((item) => (new Date(item.lastOpened) >= week))
                .map((item) => renderItemListing(item, displayItem, true, false))
            }
          </div>

          <div className="recents-section-header">
            <span>Last month</span>
          </div>
          <div className="recents-grid-item-listing">
            {
              filtered
                .filter((item) => (new Date(item.lastOpened) < week && new Date(item.lastOpened) >= month))
                .map((item) => renderItemListing(item, displayItem, true, false))
            }
          </div>

          <div className="recents-section-header">
            <span>Last few months</span>
          </div>
          <div className="recents-grid-item-listing">
            {
              filtered
                .filter((item) => (new Date(item.lastOpened) < month && new Date(item.lastOpened) >= sixMonths))
                .map((item) => renderItemListing(item, displayItem, true, false))
            }
          </div>

          <div className="recents-section-header">
            <span>Older</span>
          </div>
          <div className="recents-grid-item-listing">
            {
              filtered
                .filter((item) => (new Date(item.lastOpened) < sixMonths))
                .map((item) => renderItemListing(item, displayItem, true, false))
            }
          </div>
        </>
      }
    </div>
  );
}

export default RecentsView;

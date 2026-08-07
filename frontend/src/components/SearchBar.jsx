import { Search } from "lucide-react";
import { useState } from "react";
import "./css/SearchBar.css"
import "../css/common.css"
import useExplorerOperations from "../context/useExplorerOperations";
import { useExplorer } from "../context/ExplorerContext";

function SearchBar({ currentPageIdx }) {
  const {filteredItemIdSet, itemMap, setFilteredItemIdSet} = useExplorer();
  const {searchItems} = useExplorerOperations(currentPageIdx);

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div className="search-bar">
        <Search className="search-icon"/>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") searchItems(searchQuery);
          }}
        />
        {
          filteredItemIdSet?.size > 0 &&
          <div className="search-results"> 
            {
              [...filteredItemIdSet].map((id) => (
                <div className="search-result-item"> {itemMap.get(id).name} </div>
              ))
            }
          </div>
        }
      </div>
      {filteredItemIdSet?.size > 0 && <div className="in-place-overlay" onClick={(e) => {e.stopPropagation(); setFilteredItemIdSet(new Set)}}> </div>}
    </>      
  )
}

export default SearchBar;

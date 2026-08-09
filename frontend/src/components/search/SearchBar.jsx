import { File, Folder, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import "./css/SearchBar.css"
import "../../css/common.css"
import "../workspace/pages/css/ItemTreeView.css"
import useExplorerOperations from "../../context/useExplorerOperations";
import { useExplorer } from "../../context/ExplorerContext";
import SearchFilterOptions from "./SearchFilterOptions";

function SearchBar({ currentPageIdx, draggedItem, renderItemListing }) {
  const {filteredItemIdSet, itemMap, setFilteredItemIdSet} = useExplorer();
  const {searchItems} = useExplorerOperations(currentPageIdx);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFiltersIsOpen, setSearchFiltersIsOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({
    type: null, contentType: null, createdAfter: null, createdBefore: null, updatedAfter: null, updatedBefore: null
  });

  function exitResults() {
    setFilteredItemIdSet(null);
  }

  useEffect(() => {
		window.addEventListener("click", exitResults);
		return () => {
			window.removeEventListener("click", exitResults);
		}
	}, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
        if (searchQuery.trim()) {
            searchItems(searchQuery);
        } else {
          setFilteredItemIdSet(null);
        }
    }, 100); // setTimeout(function, delay), runs once

    return () => clearTimeout(timeout); // cancels previously scheduled run
  }, [searchQuery]);

  function displayItem(item) {
    return (
      <div className="item">
        {item.type === "FOLDER" ?  <Folder/> : <File/>}
        <span> {item.name} </span>
      </div>
    );
  }

  return (
    <>
      {
        searchFiltersIsOpen && 
        <div className="overlay-no-color" onClick={(e) => {
            e.stopPropagation();
            setSearchFiltersIsOpen(false);
          }}
        >
          <SearchFilterOptions 
            filterValues={filterValues}
            setFilterValues={setFilterValues} 
            setSearchFiltersIsOpen={setSearchFiltersIsOpen}
          />
        </div>
      }
      <div className="search-bar">
        <Search className="search-icon"/>
        <button 
          className="search-filters-button"
          style={searchFiltersIsOpen ? {border: "2px solid orange"} : undefined}
          onClick={(e) => {
            e.stopPropagation();
            setSearchFiltersIsOpen(true);
          }}
        > 
          {<Plus size={20}/>} {"Add filters"} 
        </button>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onClick={(e) => {
            e.stopPropagation();
            if (searchQuery.trim()) searchItems(searchQuery);
          }}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") searchItems(searchQuery);
            if (e.key === "Escape") exitResults(); 
          }}
        />
        {
          filteredItemIdSet?.size > 0 &&
          <div className="search-results" style={{opacity: draggedItem ? 0.3 : 1.0}}> 
            {
              [...filteredItemIdSet].map((id) => (
                <div> {renderItemListing(itemMap.get(id), displayItem, true, true, true)} </div>
              ))
            }
          </div>
        }
        {
          filteredItemIdSet && filteredItemIdSet.size === 0 &&
          <div className="search-results" style={{opacity: draggedItem ? 0.3 : 1.0}}> No results. </div>
        }
      </div>
    </>      
  )
}

export default SearchBar;

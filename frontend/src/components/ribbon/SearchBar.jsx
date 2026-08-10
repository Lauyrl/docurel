import "./css/SearchBar.css";
import "../../css/common.css";
import { File, Folder, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useExplorer } from "../../context/ExplorerContext";
import { formatFileSize } from "../../common";
import useExplorerOperations from "../../context/useExplorerOperations";
import FunnelSearch from "./css/FunnelSearch.svg";
import SortSearch from "./css/SortSearch.svg";
import FilterConfig from "./components/FilterConfig";
import SortConfig from "./components/SortConfig";

function SearchBar({ currentPageIdx, draggedItem, renderItemListing }) {
  const {filteredItemIdSet, itemMap, setFilteredItemIdSet} = useExplorer();
  const {searchItems} = useExplorerOperations(currentPageIdx);

  // add this into global state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFiltersIsOpen, setSearchFiltersIsOpen] = useState(false);
  const [searchSortIsOpen, setSearchSortIsOpen] = useState(false);
  const [searchFilterValues, setSearchFilterValues] = useState({
    type: null, contentType: null, createdAfter: null, createdBefore: null, updatedAfter: null, updatedBefore: null
  });
  const [searchSortValues, setSearchSortValues] = useState({
    sortBy: "Name similarity", descending: true
  })

  function anyFilterActive() {
    return (searchFilterValues.type || searchFilterValues.contentType || searchFilterValues.createdAfter || searchFilterValues.createdBefore || searchFilterValues.updatedAfter || searchFilterValues.updatedBefore);
  }

  function search() {
    if (searchQuery || anyFilterActive()) { 
      searchItems(
        searchQuery, searchFilterValues.type, searchFilterValues.contentType, 
        searchFilterValues.createdAfter, searchFilterValues.createdBefore, searchFilterValues.updatedAfter, searchFilterValues.updatedBefore, 
        searchSortValues.sortBy, searchSortValues.descending
      );
    }
  }

  function confirmFilters() {
    search();
    setSearchFiltersIsOpen(false);
  }

  function confirmSort() {
    search();
    setSearchSortIsOpen(false);
  }

  function exitResults() {
    setFilteredItemIdSet(null);
  }

  useEffect(() => {
    search();
  }, [searchFilterValues, searchSortValues]);

  useEffect(() => {
		window.addEventListener("click", exitResults);
		return () => {
			window.removeEventListener("click", exitResults);
		}
	}, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
        if (searchQuery.trim()) {
            search();
        } else {
          setFilteredItemIdSet(null);
        }
    }, 100); // setTimeout(function, delay), runs once

    return () => clearTimeout(timeout); // cancels previously scheduled run
  }, [searchQuery]);

  function getPathTo(destItem) {
    let path = []
    let item = destItem;
    while (item && !item.userRoot) {
      path.push(item.name);
      item = itemMap.get(item.publicParentId);
    } 
    return "Path: /" + path.reverse().join("/");
  }

  function displayItem(item) {
    return (
      <div className="result-item">
        <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
          {item.type === "FOLDER" ?  <Folder/> : <File/>}
          <div style={{display: "flex", flexDirection: "column"}}>
            <div> {item.name}  </div>
            <div style={{display: "flex", gap: "20px", fontSize: 16}}>
              <span style={{ fontStyle: "italic", fontFamily: "calibri" }}> 
                {getPathTo(item)}  
              </span>
              <span> 
                Created On: {new Date(item.createdAt).toLocaleDateString()} 
              </span>
              <span>
                Last Updated: {new Date(item.updatedAt).toLocaleDateString()} 
              </span>
            </div>
          </div>
        </div>
        <span style={{fontSize: 17}}> {formatFileSize(item.sizeBytes)} </span>
      </div>
    );
  }

  return (
    <>
      {
        searchFiltersIsOpen && 
        <div className="overlay" onClick={(e) => {
            e.stopPropagation();
            setSearchFiltersIsOpen(false);
          }}
        >
          <FilterConfig 
            filterValues={searchFilterValues}
            setFilterValues={setSearchFilterValues} 
            confirmFilters={confirmFilters}
            isForSearch={true}
          />
        </div>
      }
      {
        searchSortIsOpen &&
        <div className="overlay" onClick={(e) => {
            e.stopPropagation();
            setSearchSortIsOpen(false);
          }}
        >
          <SortConfig 
            sortValues={searchSortValues}
            setSortValues={setSearchSortValues}
            confirmSort={confirmSort}
            isForSearch={true}
          />
        </div>
      }
      <div className="search-bar">
        {(searchFiltersIsOpen || searchSortIsOpen) && <div className="search-bar-highlight"></div> }
        <Search size={28} className="search-icon"/>

        <button 
          className="search-filters-button"
          style={{backgroundColor: (anyFilterActive() ? "#e7772d" : undefined)}}
          onClick={(e) => {
            e.stopPropagation();
            setSearchFiltersIsOpen(true);
          }}
        > 
          {<img src={FunnelSearch} alt="" size={20}/>} {"Filters"} 
        </button>

        <button 
          className="search-filters-button"
          style={{left: "143px", backgroundColor: ((searchSortValues.sortBy !== "Name similarity" || !searchSortValues.descending) ? "#e7772d" : undefined)}}
          onClick={(e) => {
            e.stopPropagation();
            setSearchSortIsOpen(true);
          }}
        > 
          {<img src={SortSearch} alt="" size={20}/>} {"Sort by"} 
        </button>
        
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onClick={(e) => {
            e.stopPropagation();
            if (!filteredItemIdSet) search();
          }}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") search();
            if (e.key === "Escape") exitResults(); 
          }}
        />
        {
          (searchQuery || anyFilterActive()) && filteredItemIdSet?.size > 0 &&
          <div className="search-results" style={{opacity: draggedItem ? 0.3 : 1.0}}> 
            {
              [...filteredItemIdSet].map((id) => (
                <div> {renderItemListing(itemMap.get(id), displayItem, true, true, true)} </div>
              ))
            }
          </div>
        }
        {
          (searchQuery || anyFilterActive()) && filteredItemIdSet && filteredItemIdSet.size === 0 &&
          <div className="search-results" style={{opacity: draggedItem ? 0.3 : 1.0}}> No results. </div>
        }
      </div>
    </>      
  )
}

export default SearchBar;

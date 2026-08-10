import { ArrowUpDown, File, Folder, Search } from "lucide-react";
import { useEffect, useState } from "react";
import "./css/SearchBar.css"
import "../../css/common.css"
import "../workspace/pages/css/ItemTreeView.css"
import useExplorerOperations from "../../context/useExplorerOperations";
import { useExplorer } from "../../context/ExplorerContext";
import SearchFilterOptions from "./SearchFilterOptions";
import FunnelSearch from "./css/FunnelSearch.svg"
import { formatFileSize } from "../../common";
import SearchSortOptions from "./SearchSortOptions";

function SearchBar({ currentPageIdx, draggedItem, renderItemListing }) {
  const {filteredItemIdSet, itemMap, setFilteredItemIdSet} = useExplorer();
  const {searchItems} = useExplorerOperations(currentPageIdx);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFiltersIsOpen, setSearchFiltersIsOpen] = useState(false);
  const [searchSortIsOpen, setSearchSortIsOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({
    type: null, contentType: null, createdAfter: null, createdBefore: null, updatedAfter: null, updatedBefore: null
  });
  const [sortValues, setSortValues] = useState({
    sortBy: "Name similarity", descending: true
  })

  function anyFilterActive() {
    return (filterValues.type || filterValues.contentType || filterValues.createdAfter || filterValues.createdBefore || filterValues.updatedAfter || filterValues.updatedBefore);
  }

  function search() {
    if (searchQuery || anyFilterActive()) { 
      searchItems(
        searchQuery, filterValues.type, filterValues.contentType, 
        filterValues.createdAfter, filterValues.createdBefore, filterValues.updatedAfter, filterValues.updatedBefore, 
        sortValues.sortBy, sortValues.descending
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
          <SearchFilterOptions 
            filterValues={filterValues}
            setFilterValues={setFilterValues} 
            confirmFilters={confirmFilters}
            search={search}
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
          <SearchSortOptions 
            sortValues={sortValues}
            setSortValues={setSortValues}
            confirmSort={confirmSort}
            search={search}
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
          style={{left: "143px", backgroundColor: ((sortValues.sortBy !== "Name similarity" || !sortValues.descending) ? "#e7772d" : undefined)}}
          onClick={(e) => {
            e.stopPropagation();
            setSearchSortIsOpen(true);
          }}
        > 
          <ArrowUpDown size={21}/> {"Sort by"} 
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

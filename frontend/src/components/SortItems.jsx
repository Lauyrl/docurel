import "../css/common.css";
import "./css/ribbon.css";
import { useExplorer } from "../context/ExplorerContext";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import SearchSortOptions from "./search/SearchSortOptions";

function SortItems() {
  const { sortValues, setSortValues } = useExplorer();
  const [searchSortIsOpen, setSearchSortIsOpen] = useState(false);

  return (
    <>  
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
              confirmSort={() => setSearchSortIsOpen(false)}
            />
          </div>
      }
      <div>
        <button
          className="ribbon-button"
          style={{backgroundColor: ((sortValues.sortBy !== "Alphabetical" || sortValues.descending) ? "#e7772d" : undefined)}}
          onClick={() => {setSearchSortIsOpen(true)}}
        >
          <ArrowUpDown />
          {"Sort Items"}
        </button>
      </div>
    </>
  );
}

export default SortItems;

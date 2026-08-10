import "../../css/common.css";
import "./css/ribbon.css";
import { useExplorer } from "../../context/ExplorerContext";
import { useState } from "react";
import { Filter } from "lucide-react";
import useExplorerOperations from "../../context/useExplorerOperations";
import FilterConfig from "./components/FilterConfig";

function FilterItems() {
  const { filterValues, setFilterValues } = useExplorer();
  const { anyFilterActive } = useExplorerOperations(0);
  const [filtersIsOpen, setFiltersIsOpen] = useState(false);

  return (
    <>
      {
        filtersIsOpen &&
        <div className="overlay" onClick={(e) => {
          e.stopPropagation();
          setFiltersIsOpen(false);
        }}
        >
          <FilterConfig
            filterValues={filterValues}
            setFilterValues={setFilterValues}
            confirmFilters={() => {setFiltersIsOpen(false)}}
          />
        </div>
      }
      <div>
        <button
          className="ribbon-button"
          style={{backgroundColor: (anyFilterActive() ? "#e7772d" : undefined)}}
          onClick={() => {setFiltersIsOpen(true)}}
        >
          <Filter />
          {"Filter Items"}
        </button>
      </div>
    </>
  );
}

export default FilterItems;

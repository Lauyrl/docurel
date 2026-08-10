import { useEffect } from "react"
import "../../css/common.css"
import "./css/SearchSortOptions.css"

function SearchSortOptions({ sortValues, setSortValues, confirmSort, search }) {
  useEffect(() => {
    search();
  }, [sortValues])

  return (
    <div 
      className="modal" 
      style={{minWidth: "355px"}}
      onClick={(e) => {e.stopPropagation()}}
    >
      <h2> Sort search results </h2>

      <div className="sort-config">
        {"Sort by: "}
        <select
          value={sortValues.sortBy || "Name similarity"}
          onChange={(e) => setSortValues({ ...sortValues, sortBy: e.target.value })}  
        >
          <option value={"Name similarity"}> Name similarity </option>
          <option value={"Alphabetical"}>    Alphabetical    </option>
          <option value={"Size"}>            Size            </option>
          <option value={"Date created"}>    Date created    </option>
          <option value={"Date updated"}>    Date updated    </option>
        </select>
        <button onClick={() => setSortValues({...sortValues, descending: !sortValues.descending})}>
          {sortValues.descending ? "Descending" : "Ascending"}
        </button>
      </div>

      <div className="modal-buttons">
        <button onClick={() => setSortValues({sortBy: "Name similarity", descending: true})}> Reset to defaults </button>
        <button onClick={confirmSort}> Confirm </button>
      </div>
    </div>
  )
}

export default SearchSortOptions;

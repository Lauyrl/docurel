import { useState } from "react";
import "../../css/common.css"

function SearchSortOptions({ sortValues, setSortValues, confirmSort }) {
  return (
    <div 
      className="modal" 
      style={{minWidth: "100px"}}
      onClick={(e) => {e.stopPropagation()}}
    >
      <h2> Sort search results </h2>

      <div style={{display: "flex", gap: "10px"}}>
        {"Sort by: "}
        <select>
          <option> Name similarity </option>
          <option> Size            </option>
          <option> Date created    </option>
          <option> Date modified   </option>
        </select>
        <button onClick={() => setSortValues({...sortValues, descending: !sortValues.descending})}>
          {sortValues.descending ? "Descending" : "Ascending"}
        </button>
      </div>
      <div className="modal-buttons">
        <button onClick={() => setSortValues({sortBy: "searchQuery", descending: true})}> Reset to defaults </button>
        <button onClick={confirmSort}> Confirm </button>
      </div>
    </div>
  )
}

export default SearchSortOptions;

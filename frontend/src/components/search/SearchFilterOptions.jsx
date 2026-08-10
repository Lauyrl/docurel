import "./css/SearchFilterOptions.css"
import "../../css/common.css"
import DateFilter from "./DateFilter";

function SearchFilterOptions({ filterValues, setFilterValues, confirmFilters }) {

  function clearFilters() {
    setFilterValues({
      type: null, contentType: null, createdAfter: null, createdBefore: null, updatedAfter: null, updatedBefore: null
    });
  }

  return (
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2> Filter search results </h2>

      <div className="search-filter-option" style={{ opacity: filterValues.type ? 1.0 : 0.7 }}>
        <span> Type: </span>
        <select 
          className="select-filter"
          value={filterValues.type || ""}
          onChange={(e) => setFilterValues({ ...filterValues, type: e.target.value })}
        >
          <option value={""}> Any </option>
          <option value={"DOCUMENT"}> Document </option>
          <option value={"FOLDER"}> Folder </option>
        </select>
      </div>

      <div className="search-filter-option" style={{ opacity: filterValues.contentType ? 1.0 : 0.7 }}>
        <span> Content Type: </span>
        <select 
          className="select-filter"
          value={filterValues.contentType || ""}
          onChange={(e) => setFilterValues({ ...filterValues, contentType: e.target.value })}
        >
          <option value={""}> Any </option>
          <option value={"text/plain"}> .txt  </option>
          <option value={"image/jpeg"}> .jpg  </option>
          <option value={"image/png"}>  .png  </option>
          <option value={"image/gif"}>  .gif  </option>
          <option value={"image/webp"}> .webp </option>
          <option value={"video/mp4"}>  .mp4  </option>
          <option value={"video/webm"}> .webm </option>
          <option value={"audio/wav"}>  .wav  </option>
          <option value={"audio/mp3"}>  .mp3  </option>
          <option value={"application/pdf"}> .pdf </option>
          <option value={"application/octet-stream"}> Other </option>
        </select>
      </div>

      <div className="search-filter-option" style={{ opacity: (filterValues.createdAfter || filterValues.createdBefore) ? 1.0 : 0.7 }}>
        <span> Created Between: </span>

        <div className="date-controls">
          <DateFilter
            value={filterValues.createdAfter}
            onChange={(e) => setFilterValues({ ...filterValues, createdAfter: e.target.value })}
            placeholder={"After"}
          />
          {"—"}
          <DateFilter
            value={filterValues.createdBefore}
            onChange={(e) => setFilterValues({ ...filterValues, createdBefore: e.target.value })}
            placeholder={"Before"}
          />
        </div>
      </div>

      <div className="search-filter-option" style={{ opacity: (filterValues.updatedAfter || filterValues.updatedBefore) ? 1.0 : 0.7 }}>
        <span> Updated Between: </span>

        <div className="date-controls">
          <DateFilter
            value={filterValues.updatedAfter}
            onChange={(e) => setFilterValues({ ...filterValues, updatedAfter: e.target.value })}
            placeholder={"After"}
          />
          {"—"}
          <DateFilter
            value={filterValues.updatedBefore}
            onChange={(e) => setFilterValues({ ...filterValues, updatedBefore: e.target.value })}
            placeholder={"Before"}
          />
        </div>
      </div>
      
      <div className="modal-buttons">
        <button onClick={clearFilters}>
          Clear Filters
        </button>
        <button onClick={confirmFilters}>
          Confirm
        </button>
      </div>
    </div>
  )
}

export default SearchFilterOptions;

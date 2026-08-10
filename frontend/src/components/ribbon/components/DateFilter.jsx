import "./css/DateFilter.css"
import { useRef } from "react";
import { Calendar } from "lucide-react";

function DateFilter({ value, onChange, placeholder }) {
  const calendarRef = useRef(null);
  return (
    <div 
      className="date-filter"
      style={{ opacity: value ? 1.0 : 0.7 }}
      onClick={() => calendarRef.current?.showPicker()}
    >
      <span> {value || placeholder} </span> 
      <Calendar/>
      <input 
        ref={calendarRef}
        type="date"
        value={value || ""}
        onChange={onChange}
      />
    </div>
  );
}

export default DateFilter;

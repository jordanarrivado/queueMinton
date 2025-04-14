import React from "react";

const Toggle = ({ isChecked, onToggle }) => {
  

  return (
    <div className={`toggle-container ${isChecked ? 'checked' : ''}`} onClick={onToggle}>
      <input
        type="checkbox"
        id="toggle-switch"
        className="toggle-input"
        checked={isChecked}
        onChange={onToggle}
      />
      <label htmlFor="toggle-switch" className="toggle-label"></label>
    </div>
  );
};

export default Toggle;

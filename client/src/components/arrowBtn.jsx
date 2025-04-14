import React from 'react';

const ArrowBtn = ({onNavigationMobile}) => {

  const handleClick = (component) => {
    onNavigationMobile(component);
  }
  return (
  <div className="edge-arrow" onClick={() => handleClick("matchNcourt")}>
    <span className="arrow">&rarr;</span>
  </div>
  )
}

export default ArrowBtn;

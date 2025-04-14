import React from 'react';

const GameMode = ({ isChecked, setMode }) => {
  const handleClick = (md) => {
    setMode(md);
  };

  const lightTheme = "primary:#1b1f4b,secondary:#1b1f4b";
  const darkTheme = "primary:#37e2e2,secondary:#37e2e2";
  const COLORS = isChecked ? darkTheme : lightTheme;

  return (
    <div className="game-mode">
      <h3 className="heading">Select Your Game Mode</h3>
      
      <div className="modes-container">
        <div className="mode-box left" onClick={() => handleClick('Random')}>
          <h3 className="inside">Random Mode</h3>
          <lord-icon
            src="https://cdn.lordicon.com/rslqulwh.json"
            trigger="loop"
            delay="1000"
            colors={COLORS}
          ></lord-icon>
        </div>

        <div className="mode-box right" onClick={() => handleClick('Classic')}>
          <h3 className="inside">Classic Mode</h3>
          <lord-icon
            src="https://cdn.lordicon.com/nmguxqka.json"
            trigger="loop"
            delay="1500"
            colors={COLORS}
          ></lord-icon>
        </div>
      </div>
    </div>
  );
};

export default GameMode;

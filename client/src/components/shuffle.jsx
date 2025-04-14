import React from 'react';
import PropTypes from 'prop-types';
import TypingEffect from './effects/EffectInfo';
import Swal from 'sweetalert2';
import ShuffleWhite from './icons/shuffleWhite.png';
import ShuffleBlack from './icons/shuffleBlack.png'

const Shuffle = ({ generateRandomMatch, generateClassicMatch, text = "Generate Match", isChecked }) => {
  const icon = isChecked ? ShuffleWhite : ShuffleBlack;

  const handleGenerateMatch = () => {
    const gameMode = localStorage.getItem('GameMode');
    if (gameMode === 'Random') {
      generateRandomMatch();
    } else if (gameMode === 'Classic') {
      generateClassicMatch();
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Game Mode',
        text: 'Please select a valid game mode.',
      });
    }
  };


  

  return (
    <div
      className="shuffle"
      aria-label="Generate Match Button"
      role="button"
      tabIndex="0"
      onClick={handleGenerateMatch}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleGenerateMatch();
        }
      }}
    >
      <TypingEffect text={text} speed={50} />
      <img src={icon} alt="icon" />
    </div>
  );
};

Shuffle.propTypes = {
  generateRandomMatch: PropTypes.func.isRequired,
  generateClassicMatch: PropTypes.func.isRequired,
  text: PropTypes.string,
};

export default Shuffle;

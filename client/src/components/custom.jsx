import React from 'react';
import TypingEffect from './effects/EffectInfo';
import CustomWhite from './icons/customWhite.png';
import CustomBlack from './icons/customBlack.png'

const Custom = ({ onShowCustom, isChecked }) => { 

  const icon = isChecked ? CustomWhite : CustomBlack;
  const text = "Custom Match";
  return (
    <div className="custom" onClick={onShowCustom}>
      <TypingEffect text={text} speed={60}/>
      <img src={icon} alt="icon" />
    </div>
  )
}

export default Custom;
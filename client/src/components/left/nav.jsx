import React, { useState,useEffect } from 'react';

const Nav = ({ onNavigationClick, sessionStart, selectedComponent,click,setClick }) => {

  useEffect(()=>{
    if(!sessionStart && selectedComponent === 'selectArea'){
      onNavigationClick('allComponent');
    }

  },[sessionStart]);


  const handleClick = (component) => {
    onNavigationClick(component);
    setClick('mainTb');
    console.log(component);
    if (component === 'liveView') {
      window.open('/App');
    }
  };


  const hasV = sessionStart ? 'allComponent' : 'selectArea';
    
  return (
    <div className="nav">
      <ul className='nav-list'>
        <li 
          title='Dashboard' 
          onClick={() => handleClick('displayDashboard')} 
          className={selectedComponent === 'displayDashboard' ? 'active' : ''}
        >
          <lord-icon
            src="https://cdn.lordicon.com/ajfmgpbq.json"
            trigger="hover"
          />
        </li>
        
        <li 
          title='Active Session' 
          onClick={() => handleClick(hasV)}
          className={selectedComponent === hasV ? 'active' : ''
          }
        >
          <lord-icon
            src="https://cdn.lordicon.com/yicxhqzo.json"
            trigger="hover"
          />
        </li>

        <li 
          title='Payment & Record' 
          onClick={() => handleClick('displayPayment')} 
          className={selectedComponent === 'displayPayment' ? 'active' : ''}
        >
          <lord-icon
            src="https://cdn.lordicon.com/muznqwnj.json"
            trigger="hover"
            state="morph-coins"
          />
        </li>
        
        <li 
          title='History' 
          onClick={() => handleClick('displayHistory')} 
          className={selectedComponent === 'displayHistory' ? 'active' : ''}
        >
          <lord-icon
            src="https://cdn.lordicon.com/yryfzpno.json"
            trigger="hover"
          />
        </li>
        
        <li 
          title='Settings'
          onClick={() => handleClick('selectSettings')} 
          className={selectedComponent === 'selectSettings' ? 'active' : ''}
        >
          <lord-icon
            src="https://cdn.lordicon.com/noklggsz.json"
            trigger="hover"
            state="hover-pinch"
          />
        </li>
        
        <li 
          title='liveView'
          onClick={() => handleClick('liveView')} 
          className={selectedComponent === 'liveView' ? 'active' : ''}
        >
          <lord-icon
            src="https://cdn.lordicon.com/wzkffkaz.json"
            trigger="hover"
          />
        </li>
      </ul>
    </div>
  );
};

export default Nav;

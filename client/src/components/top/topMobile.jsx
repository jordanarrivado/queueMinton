import React, { useState, useEffect } from "react";
import logo from "../icons/newLogo.png";
import { IoMenu, IoClose } from "react-icons/io5"; 
import Swal from "sweetalert2";
import End from "./end";
import Toggle from "./toggle";

const TopMobile = ({onNavigationMobile, selectedComponentMobile, user, logout,setClick,setSessionStart,sessionStart, isChecked, handleToggle }) => {
  const [showNav, setShowNav] = useState(false);
  const [ifStarted, setIfStarted] = useState('');

  useEffect(()=>{
      if(!sessionStart){
        onNavigationMobile('dashboardMobile');
      }
  
    },[sessionStart]);

  const toggleNav = () => {
    setShowNav(!showNav);
  };

  const handleClick = (component) => {
    onNavigationMobile(component);
    setClick('mainTb');
  }

  const handleLogout = () => {
      const sessionText = ifStarted ? 'The session will end automatically if you Logout.' : 'Do you really want to log out?';
      Swal.fire({
        title: 'Are you sure?',
        text: sessionText,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, log out!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem('Session'); 
          localStorage.removeItem('LocalArea'); 
          localStorage.removeItem('GameMode'); 
          setIfStarted(false);
          logout();
          
          Swal.fire({
            title: 'Logged Out',
            text: 'You have been successfully logged out.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        }
      });
    };


  useEffect(() => {
    const sessionStart = localStorage.getItem("Session");
    setIfStarted(sessionStart)
  },[]);
  
  const isAreaDis = ifStarted ? "M&A" : "disArea";

  return (
    <div className="topMobile">
      <img src={logo} alt="logo" className="logo123" />
      <h2 className="titleMobile">Q-Minton</h2>
      {ifStarted && <End
        sessionStart={sessionStart}
        setSessionStart={setSessionStart}
      />}
      <div className="menu-icon" onClick={toggleNav}>
        {showNav ? <IoClose size={28} /> : <IoMenu size={28} />}
      </div>

      <nav className={`mobile-menu ${showNav ? "show" : ""}`}>
        <ul>
          <li>Account: {user.email}</li>
          <li><Toggle isChecked={isChecked} onToggle={handleToggle} /></li>
          <li onClick={() => handleClick('dashboardMobile')}
            className={selectedComponentMobile === 'dashboardMobile' ? 'active' : ''}
          >Dashboard</li>
          <li onClick={() => handleClick(isAreaDis)}
            className={selectedComponentMobile === 'M&A' ? 'active' : ''}
          >{ifStarted ? "Manage Game" : "Add Courts"}</li>
          <li onClick={() => handleClick('paymentMobile')}
           className={selectedComponentMobile === 'paymentMobile' ? 'active' : ''}
          >Payment</li>
          <li onClick={() => handleClick('historyMobile')}
            className={selectedComponentMobile === 'historyMobile' ? 'active' : ''}  
          >History</li>
          <li onClick={() => handleClick('settingsMobile')}
            className={selectedComponentMobile === 'settingsMobile' ? 'active' : ''}  
          >Settings</li>
          <li onClick={() => handleClick('liveMobile')}>Live viewing</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </nav>
    </div>
  );
};

export default TopMobile;

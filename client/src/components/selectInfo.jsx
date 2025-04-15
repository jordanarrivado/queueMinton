import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TypingEffect from './effects/EffectInfo';
import RacketScene from './effects/racketScene';
import Swal from 'sweetalert2';

const SelectInfo = ({ 
  selectedArea, 
  mode, 
  user,
  sessionStart, 
  setSessionStart,
  setSessions,
  sessions,
  activeComponent,
  setActiveComponent,
  onNavigationClick,
}) => {
  const [formattedDateTime, setFormattedDateTime] = useState('');
  const [courtType, setCourtType] = useState('');


  useEffect(() => {
    const sessionCurrentDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const formatted = new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Manila'
    }).format(sessionCurrentDate);
    setFormattedDateTime(formatted);
    setSessionStart(localStorage.getItem('Session'));
  }, [setSessionStart]);

  useEffect(() => {
    const fetchCourtType = async () => {
      try{
        const response = await axios.get(`https://212.85.25.203:3001/users/${user.email}/areas/${selectedArea.name}/courtFeeType`);
        setCourtType(response.data.courtFeeType);
      }catch(error){
        console.error("Error fetching Court Type: ", error);
      }
    }
    if (user && selectedArea) {
      fetchCourtType();
    }
   
  },[user, selectedArea]);


  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`https://212.85.25.203:3001/users/${user.email}/areas/${selectedArea.name}/sessions`);
        setSessions(response.data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };
    if (user && selectedArea) {
      fetchSessions();
    }
  }, [user, selectedArea, setSessions]);



  const handleSession = async (component, mode) => {
    setSessionStart(localStorage.getItem('Session')); 
    const displayData = selectedArea && mode;

    if (displayData) {
      try {
        onNavigationClick(component);
        setActiveComponent(component);
        localStorage.setItem('Session', formattedDateTime); 
        localStorage.setItem('LocalArea', selectedArea.name); 
        localStorage.setItem('GameMode', mode); 
        await axios.put(
          `https://212.85.25.203:3001/users/${user.email}/areas/${selectedArea.name}/session`, 
          { mode, sessionCurrentDate: formattedDateTime }
        );
        console.log(typeof formattedDateTime);
      } catch (error) {
        console.error('Error adding session:', error);
      }
    }
    else{
      Swal.fire({
        icon: 'error',
        title: 'Select First',
        text: 'Please Select Area and Mode',
      });
    }
  };

  

  const text1 = 'Information';
  const text2 = selectedArea ? `⮞ Area: ${selectedArea.name}` : `No Area Selected`;
  const text3 = `⮞ Mode: ${mode}`;
  const displayData = selectedArea && mode ? 'allComponent': '';
  return (
    <div className='selectInfo'>
      <div className='informt'>
        <TypingEffect text={text1} speed={100} />
        <TypingEffect text={text2} speed={100} />
        <TypingEffect text={`⮞ Court type: ${courtType}`} speed={100} />
        <TypingEffect text={text3} speed={100} />
        <br />
        <button 
          className={`btn ${activeComponent === 'allComponent' ? 'active' : ''}`} 
          onClick={() => handleSession(displayData , mode)}
        >
          Confirm?
        </button>
      </div>
      
      <RacketScene/>
    </div>
  );
};

export default SelectInfo;
import React, { useEffect } from 'react';
import axios from 'axios';
import TypingEffect from '../effects/typingEffectTitle';

const Title = ({user, mode, selectedArea,setSessions,sessions }) => {
  const gameMode = localStorage.getItem('GameMode');
  const localArea = localStorage.getItem('LocalArea');
  const displayData = localStorage.getItem('Session') && localArea && gameMode;

  const areaName = localArea ? localArea : 'No Area Selected';
  

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/${user.email}/areas/${selectedArea.name}/sessions`);
        setSessions(response.data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };
    if (user && selectedArea) {
      fetchSessions();
    }
  }, [user, selectedArea, setSessions]);



  const text = displayData
    ? `Area: ${areaName}, Game Mode: ${gameMode}`
    : "Badminton Queuing Management System";

  const speeds = text === "Badminton Queuing Management System" ? 36 : 20;

  useEffect(() => {
   // console.log(areaName); 
   // console.log(sessions);
  }, [areaName]);

  return (
    <div className="title">
      <TypingEffect text={text} speed={speeds} />
    </div>
  );
};

export default Title;

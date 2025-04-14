import React, {useRef, useEffect, useState} from 'react'
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, Bar, Rectangle,
  BarChart,ResponsiveContainer
} from 'recharts';

const LiveView = ({user,areas,mode,inMatch,setInMatch,courts,setCourts,players, setPlayers,selectedComponent,setSelectedComponent,isChecked}) => {

  const [areaName, setAreaName] = useState('');
  const gameMode = localStorage.getItem('GameMode');
  const localArea = localStorage.getItem('LocalArea');
  const displayData = localStorage.getItem('Session') && localArea && gameMode;

  const fullScreenRef = useRef(null);

  const toggleFullscreen = () => {
    const elem = fullScreenRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };


  useEffect(()=>{
    setAreaName(localArea);
    
  },[players, inMatch, courts]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const sessionDate = localStorage.getItem('Session');
        const localArea = localStorage.getItem('LocalArea');

        if (!sessionDate || !localArea) {
          console.warn('Session date or local area not found in localStorage.');
          return;
        }

        const [playerRes,inMatchRes,courtsRes] = await Promise.all([
          await axios.get(
            `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/sessions/${encodeURIComponent(sessionDate)}/players`
          ),
          await axios.get(
            `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/sessions/${encodeURIComponent(sessionDate)}/inMatch`
          ),
          await axios.get(
            `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/sessions/${encodeURIComponent(sessionDate)}/courts`
          )
        ]);
        

        setPlayers(playerRes.data);
        setInMatch(inMatchRes.data);
        setCourts(courtsRes.data);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchPlayers();
  }, [user.email, 
    setPlayers, 
    players, 
    setInMatch,
    inMatch
  ]);





  const standByData = JSON.parse(localStorage.getItem('standBy')) || [];
  const standByPlayerIds = standByData.map(player => player.id);


  const filterPlayers = players.filter(player => 
      !inMatch.some(match => 
          [...match.team1, ...match.team2].includes(player._id)
      ) && !standByPlayerIds.includes(player._id) 
  );
  


  const standByData2 = JSON.parse(localStorage.getItem('standBy')) || [];
  const standByPlayerIds2 = standByData2.map(player => player.id);


  const standBy = players.filter(player => 
    standByPlayerIds2.includes(player._id) 
  );





  const capitalizeFirstLetter = (str) => {
    return str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : '';
  };

  

  const pageData = [
    { name: 'Player 1', Win: 12, Loss: 4 },
    { name: 'Player 2', Win: 4, Loss: 7 },
    { name: 'Player 3', Win: 10, Loss: 5 },
    { name: 'Player 4', Win: 11, Loss: 4 },
    { name: 'Player 5', Win: 8, Loss: 5 },
    { name: 'Player 6', Win: 10, Loss: 3 },
    { name: 'Player 7', Win: 4, Loss: 6 },
    { name: 'Player 8', Win: 15, Loss: 5 },
    { name: 'Player 9', Win: 6, Loss: 8 },
    { name: 'Player 10', Win: 3, Loss: 12 },
  ];




  

  const sortedData = pageData
  .map(player => ({
    ...player,
    WinRate: (player.Win / (player.Win + player.Loss)) * 100, 
  }))
  .sort((a, b) => b.WinRate - a.WinRate);
  
  const lightTheme = ['#1b1f4b', '#1b1f4b52'];
  const darkTheme = ['#00ffffe5', '#00ffff25'];
  const COLORS = isChecked ? darkTheme : lightTheme ;
  const shadow = isChecked ? 'drop-shadow(0 0 8px rgba(0, 238, 255, 0.8))' : 'drop-shadow(0 0 8px rgba(34, 51, 68, 0.8))';

  /////////////////////////////////////////////////////////////

  const containerRef = useRef(null);
  const containerRef2 = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
  
    if (!container) return;
  
    let scrollAmount = 0;
    const scrollSpeed = 0.3; 
    const scrollInterval = 30; 
    const stopTime = 2000; 
    let scrollDirection = 1; 
  
    const autoScroll = () => {
      scrollAmount += scrollSpeed * scrollDirection;
      container.scrollTop = scrollAmount;
  
     
      if (scrollAmount >= container.scrollHeight - container.offsetHeight) {
        scrollDirection = -1;
        clearInterval(scrollTimer);
        setTimeout(() => {
          scrollTimer = setInterval(autoScroll, scrollInterval);
        }, stopTime);
      } else if (scrollAmount <= 0) {
        scrollDirection = 1;
        clearInterval(scrollTimer);
        setTimeout(() => {
          scrollTimer = setInterval(autoScroll, scrollInterval);
        }, stopTime);
      }
    };
  
    let scrollTimer = setInterval(autoScroll, scrollInterval);
  
    return () => clearInterval(scrollTimer);
  }, []);
  

  useEffect(() => {
    const container = containerRef2.current;
  
    if (!container) return;
  
    let scrollAmount = 0;
    const scrollSpeed = 0.3; 
    const scrollInterval = 30; 
    const stopTime = 2000; 
    let scrollDirection = 1; 
  
    const autoScroll = () => {
      scrollAmount += scrollSpeed * scrollDirection;
      container.scrollTop = scrollAmount;
  
      if (scrollAmount >= container.scrollHeight - container.offsetHeight) {
        scrollDirection = -1;
        clearInterval(scrollTimer);
        setTimeout(() => {
          scrollTimer = setInterval(autoScroll, scrollInterval);
        }, stopTime);
      } else if (scrollAmount <= 0) {
        scrollDirection = 1;
        clearInterval(scrollTimer);
        setTimeout(() => {
          scrollTimer = setInterval(autoScroll, scrollInterval);
        }, stopTime);
      }
    };
  
    let scrollTimer = setInterval(autoScroll, scrollInterval);
  
    return () => clearInterval(scrollTimer);
  }, []);
  


  const containerRefHorizon = useRef(null);

  useEffect(() => {
    const container = containerRefHorizon.current;
    let scrollAmount = 0;
    const scrollSpeed = 1;
    const scrollInterval = 30;
    const stopTime = 3000; 
    let scrollDirection = 1; 
    let isPaused = false;

    const autoScroll = () => {
      if (container && !isPaused) {
        scrollAmount += scrollSpeed * scrollDirection;
        container.scrollLeft = scrollAmount;

        if (scrollAmount >= container.scrollWidth - container.offsetWidth || scrollAmount <= 0) {
          isPaused = true;
          scrollDirection *= -1; 
          setTimeout(() => {
            isPaused = false;
          }, stopTime);
        }
      }
    };

    const interval = setInterval(autoScroll, scrollInterval);

    return () => clearInterval(interval);
  }, []);


  const containerRefHorizon2 = useRef(null);

  useEffect(() => {
    const container = containerRefHorizon2.current;
    let scrollAmount = 0;
    const scrollSpeed = 1;
    const scrollInterval = 30;
    const stopTime = 3000; 
    let scrollDirection = 1; 
    let isPaused = false;

    const autoScroll = () => {
      if (container && !isPaused) {
        scrollAmount += scrollSpeed * scrollDirection;
        container.scrollLeft = scrollAmount;

        if (scrollAmount >= container.scrollWidth - container.offsetWidth || scrollAmount <= 0) {
          isPaused = true;
          scrollDirection *= -1; 
          setTimeout(() => {
            isPaused = false;
          }, stopTime);
        }
      }
    };

    const interval = setInterval(autoScroll, scrollInterval);

    return () => clearInterval(interval);
  }, []);





  function timeAgo(timeQueue) {
    if (!timeQueue) return "Invalid time";
  
    try {
      // Extract time and meridian (AM/PM) from input
      const [time, meridian] = timeQueue.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
  
      // Get the current time
      const now = new Date();
  
      // Create a Date object for the queue time
      const queueDate = new Date(now);
      queueDate.setHours(
        meridian === "PM" && hours !== 12
          ? hours + 12
          : meridian === "AM" && hours === 12
          ? 0
          : hours,
        minutes,
        0,
        0
      );
  
      const diffMs = now - queueDate;
      const diffMins = Math.round(diffMs / 60000); 
  
      if (diffMins < 1) return "Just now"; 
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`; 
  
      const diffHours = Math.floor(diffMins / 60); 
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`; 
  
      const diffDays = Math.floor(diffHours / 24); 
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`; 
    } catch (error) {
      console.error("Error parsing timeQueue:", error);
      return "Invalid time";
    }
  }
  


  return (
    <div className='liveView' ref={fullScreenRef}>

      <button onClick={toggleFullscreen} className="fullscreen-btn">
         <FontAwesomeIcon icon={faExpand} style={{ marginRight: '8px' }} />
         Fullscreen
      </button>

      <div className='header'>

        <h2 className='one'>{`Matches - ${inMatch.length}`}</h2>

        <div className='lefts'>
          <h3 calssName="two2"><span class="circleQ"></span> &nbsp;Player Queue - {filterPlayers.length}</h3>
          <h3 className="three"><span class="circleS"></span> &nbsp;Standby - {standBy.length}</h3>
        </div>
        
      </div>

      <div className='body'>

        <div className="matchQSeperated">
          <div className="up" ref={containerRefHorizon}>
            {inMatch.length === 0 ? (
              <h2>No Matches</h2>
            ) : (
              inMatch
                .filter((match) => {
                  const court =
                    courts &&
                    courts.find((court) =>
                      court.addMatches?.some((matchC) => matchC === match._id)
                    );
                  return Boolean(court); 
                })
                .map((match, index) => {
                  if (!match) return null;

                  const court =
                    courts &&
                    courts.find((court) =>
                      court.addMatches?.some((matchC) => matchC === match._id)
                    );
                  const isInMatch = Boolean(court);

                  const team1PlayerNames =
                    match.team1?.length > 0
                      ? match.team1
                          .map((playerId) => players.find((p) => p._id === playerId)?.name || 'Unknown Player')
                          .join(', ')
                      : 'No players';

                  const team2PlayerNames =
                    match.team2?.length > 0
                      ? match.team2
                          .map((playerId) => players.find((p) => p._id === playerId)?.name || 'Unknown Player')
                          .join(', ')
                      : 'No players';

                  return (
                    <div key={`match_${index}`} className="team-container">
                      <div className="head">
                        <h3 className="matchName">{match.name}</h3>
                        <h5 className={isInMatch ? 'in' : 'no'}>
                          {isInMatch ? 'Playing' : 'InQueue'} &nbsp;<span class="playing"></span>
                        </h5>
                      </div>
                      <hr />
                      <div className="body2">
                        <div className="team1">
                          <h4 className="h4">Team 1</h4>
                          {team1PlayerNames.split(', ').map((name, idx) => (
                            <p key={`${match._id}_team1_${idx}`}>
                              {`${capitalizeFirstLetter(name) || '****'}`}
                            </p>
                          ))}
                        </div>
                        <div className="mid">
                          <p className="vs">Vs</p>
                        </div>
                        <div className="team2">
                          <h4 className="h4">Team 2</h4>
                          {team2PlayerNames.split(', ').map((name, idx) => (
                            <p key={`${match._id}_team2_${idx}`}>
                              {`${capitalizeFirstLetter(name) || '****'}`}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>


          <div className="down" ref={containerRefHorizon2}>
            {inMatch.length === 0 ? (
              <h2>Up Coming Match..</h2>
              ) : (
              inMatch
                .filter((match) => {
                  const court =
                    courts &&
                    courts.find((court) =>
                      court.addMatches?.some((matchC) => matchC === match._id)
                    );
                  return !court; 
                })
                .map((match, index) => {
                  if (!match) return null;

                  const court =
                    courts &&
                    courts.find((court) =>
                      court.addMatches?.some((matchC) => matchC === match._id)
                    );
                  const isInMatch = Boolean(court);

                  const team1PlayerNames =
                    match.team1?.length > 0
                      ? match.team1
                          .map((playerId) => players.find((p) => p._id === playerId)?.name || 'Unknown Player')
                          .join(', ')
                      : 'No players';

                  const team2PlayerNames =
                    match.team2?.length > 0
                      ? match.team2
                          .map((playerId) => players.find((p) => p._id === playerId)?.name || 'Unknown Player')
                          .join(', ')
                      : 'No players';

                  return (
                    <div key={`match_${index}`} className="team-container">
                      <div className="head">
                        <h3 className="matchName">{match.name}</h3>
                        <h5 className={isInMatch ? 'in' : 'no'}>
                          {isInMatch ? 'Playing' : 'InQueue'} &nbsp;<span class="InQueue"></span>
                        </h5>
                      </div>
                      <hr />
                      <div className="body2">
                        <div className="team1">
                          <h4 className="h4">Team 1</h4>
                          {team1PlayerNames.split(', ').map((name, idx) => (
                            <p key={`${match._id}_team1_${idx}`}>
                              {`${capitalizeFirstLetter(name) || '****'}`}
                            </p>
                          ))}
                        </div>
                        <div className="mid">
                          <p className="vs">Vs</p>
                        </div>
                        <div className="team2">
                          <h4 className="h4">Team 2</h4>
                          {team2PlayerNames.split(', ').map((name, idx) => (
                            <p key={`${match._id}_team2_${idx}`}>
                              {`${capitalizeFirstLetter(name) || '****'}`}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
    
        </div>
              
        <div className='playerQ'>
            <div className='qlist' ref={containerRef}>
              <table>
                <thead>
                    <tr>
                      <th><b>Name</b></th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterPlayers.map((player,index) => (
                      <tr key={player._id}>
                        <td><b>{player.name}</b></td>
                        <td>
                          InQueue {timeAgo(player.timeQueue)} &nbsp;
                          <span className="circle1"></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
            <div className='standby' ref={containerRef2}>
                <table>
                  <thead>
                      <tr>
                        <th><b>Name</b></th>
                        <th>Matches</th>
                        <th>Ball</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standBy.map((player, index) => (
                        <tr key={player._id}>
                          <td><b>{player.name}</b></td>
                          <td>{player.win + player.loss}</td>
                          <td>{player.ball} &nbsp;<span class="circle2"></span></td>
                        </tr>
                      ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div className='chart'>
          <h3>Top Player Live <span class="circle"></span></h3>
          <ResponsiveContainer width="100%" height='80%'>
            <BarChart
              width={600}
              height={160}
              data={sortedData}
              margin={{
                top: 5,
                right: 30,
                left: -10,
                bottom: -10,
              }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="Win"
                fill={COLORS[0]}
                barSize={23}
            
              />
              <Bar
                dataKey="Loss"
                fill={COLORS[1]}
                barSize={23}
              
              />
            </BarChart>
        </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}

export default LiveView;

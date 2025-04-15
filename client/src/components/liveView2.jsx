import React, {useRef, useEffect, useState} from 'react'
import axios from 'axios';
import logo from'./icons/BMlogo 2.png';
//import CourtScene from './effects/courtScene';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, Bar, Rectangle,
  BarChart,ResponsiveContainer
} from 'recharts';
import { io } from "socket.io-client";

const socket = io.connect("https://212.85.25.203:3001", {
  transports: ["websocket"], 
});

const LiveView2 = ({user,areas,mode,inMatch,setInMatch,matches,courts,setCourts,players, setPlayers,selectedComponent,setSelectedComponent,isChecked,playerHistory,setPlayerHistory,setMatches}) => {
  

  const gameMode = localStorage.getItem('GameMode');
  const localArea = localStorage.getItem('LocalArea');
  const SessionDate =localStorage.getItem('Session');
  const displayData = SessionDate && localArea && gameMode;

  const standByData = JSON.parse(localStorage.getItem('standBy')) || [];
  const standByPlayerIds = standByData.map(player => player.id);

  useEffect(() => {
    console.log(matches);
    console.log(playerHistory);
  },[]);


  useEffect(() => {
    const sessionDate = localStorage.getItem("Session");
    const localArea = localStorage.getItem("LocalArea");
  
    if (!sessionDate || !localArea || !user?.email || !socket) {
      return;
    }
  
    const encodedSessionDate = encodeURIComponent(sessionDate);
  
    // Handle full session data
    const handleDataFetched = (data) => {
      setPlayers(data.players || []);
      setPlayerHistory(data.playerHistory || []);
      setMatches(data.matches || []);
      setInMatch(data.inMatch || []);
      setCourts(data.courts || []);
      // You can also handle `data.schedules` if you need it
    };
  
    const handleError = (err) => {
      console.error("Socket error:", err?.message || err);
    };
  
    socket.emit("fetchData", {
      userEmail: user.email,
      areaName: localArea,
      sessionDate: encodedSessionDate,
    });
  
    socket.on("dataFetched", handleDataFetched);
    socket.on("updateData", handleDataFetched); // handle periodic updates
    socket.on("error", handleError);
  
    // Cleanup
    return () => {
      socket.off("dataFetched", handleDataFetched);
      socket.off("updateData", handleDataFetched);
      socket.off("error", handleError);
    };
  }, [user?.email, socket]);



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

    const text = displayData
    ? `Venue: ${localArea}, Mode: ${gameMode}`
    : "Badminton Queuing Management System";


    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000); 
  
      return () => clearInterval(interval); 
    }, []);
  
    function timeAgo(timeQueue) {
      if (!timeQueue) return "Invalid time";
  
      try {
        const [time, meridian] = timeQueue.split(" ");
        const [hours, minutes] = time.split(":").map(Number);
        const now = currentTime; 
  
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

      const containerRef4Matches = useRef(null);

      useEffect(() => {
        const container = containerRef4Matches.current;
      
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

      const containerRef4Lb = useRef(null);

      useEffect(() => {
        const container = containerRef4Lb.current;
      
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

  return (

    <div className='liveBody' ref={fullScreenRef}>
      
       <button onClick={toggleFullscreen} className="fullscreen-btn">
               <FontAwesomeIcon icon={faExpand} style={{ marginRight: '8px' }} />
               Fullscreen
      </button>

      <div className='leftLive'>
      
        <div className='facilityName'>
          <h4><img src={logo} alt="logo" />{text} {SessionDate}</h4>
        </div>


        <div className='liveInfo'>
          <div className='overAll'>
            <div className='noOne'>{inMatch.length}</div>
            <div className='letterOne'>Current Matches</div>
          </div>

          <div className='matchesDone'>
            <div className='noTwo'>{matches.length - inMatch.length || "0"}|{matches.length || "0"}</div>
            <div className='letterTwo'>Matches Done</div>
          </div>

          <div className='amd'>
            <div className='noThree'>{matches.length}</div>
            <div className='letterThree'>Overall Matches</div>
          </div>
        </div>

        <div className='newPlayer'>
          <h2>Player Queue - {filterPlayers.length}</h2>
          <div className='playerQlist' ref={containerRef}>
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
                          {timeAgo(player.timeQueue)} &nbsp;
                          <span className="circle1"></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
        </div>
      </div>

      <div className='midLive' ref={containerRef4Matches}>
        <h3 className='lm'>Live Matches</h3>
        {inMatch.length === 0 ? (
          <h2>Up Coming Match..</h2>
          ) : (
          Array.from({ length: inMatch.length * 5 }) // Repeat matches in a cyclic manner
            .map((_, index) => inMatch.sort((a, b) => {
              const aInCourt = courts.some((court) => court.addMatches?.includes(a._id));
              const bInCourt = courts.some((court) => court.addMatches?.includes(b._id));
              return bInCourt - aInCourt; 
            })[index % inMatch.length]) // Cycle through matches
            .map((match, index) => {
              if (!match) return null;

              const court = courts.find((court) =>
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
                <div key={`match_${index}`} className={`team-container ${isInMatch ? 'playing' : 'inQueue'}`}>
                  <div className="head">
                    <h2 className={isInMatch ? "matchNameRed" : "matchName"}>{match.name}</h2>
                    <h4 className={isInMatch ? 'in' : 'no'}>
                      {isInMatch ? 'Playing' : 'InQueue'} &nbsp;<span className="InQueue"></span>
                    </h4>
                  </div>
                  <div className="body2">
                    <div className="team1">
                      <h4 className="h4">Team 1</h4>
                      {team1PlayerNames.split(', ').map((name, idx) => (
                        <p key={`${match._id}_team1_${idx}`}>{`${capitalizeFirstLetter(name) || '****'}`}</p>
                      ))}
                    </div>
                    <div className="mid">
                      <p className="vs">Vs</p>
                    </div>
                    <div className="team2">
                      <h4 className="h4">Team 2</h4>
                      {team2PlayerNames.split(', ').map((name, idx) => (
                        <p key={`${match._id}_team2_${idx}`}>{`${capitalizeFirstLetter(name) || '****'}`}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
        )}

      </div>


      <div className='rightLive'>
          
          <div className='leaderBoard'>
            <h2>Leaderboard - Top 10</h2>
            <div className='lbTable' ref={containerRef4Lb}>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th><b>Name</b></th>
                    <th>WinRate</th>
                  </tr>
                </thead>
                <tbody>
                  {filterPlayers
                    .sort((a, b) => (b.win / (b.win + b.Loss || 1)) - (a.win / (a.win + a.Loss || 1))) 
                    .slice(0, 10) 
                    .map((player, index) => {
                      const totalGames = player.win + player.Loss;
                      const winRate = totalGames > 0 ? (player.win / totalGames) * 100 : 0; 
                      return (
                        <tr key={player._id}>
                          <td>{index+1}</td>
                          <td><b>{player.name}</b></td>
                          <td>
                            {winRate.toFixed(2)}% &nbsp;
                            <span className="circle1"></span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
          <div className='playerStandBy'>
           <h2>Player Stand By - {standBy.length}</h2>
            <div className='standby123' ref={containerRef2}>
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
                        <td>{player.ball} &nbsp;<span class="circle123"></span></td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  )
}

export default LiveView2;

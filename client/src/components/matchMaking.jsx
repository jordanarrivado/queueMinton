import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import go from './icons/go.png';
import goBlack from './icons/goBlack.png';
import flash from './icons/flash.png';
import flashBlack from './icons/flashBlack.png';
import GridLoader from "react-spinners/GridLoader";
import TypingEffect from './effects/EffectInfo';
import EditMatchForm from "./editMatch";

import { io } from "socket.io-client";

const socket = io.connect(`${process.env.REACT_APP_API_URL3}`, {
  transports: ["websocket"],
});


const MatchMaking = ({ user, inMatch, setInMatch, matches,
  selectedBall, setSelectedBall,selectedCourt, setSelectedCourt,
  handleAddMatch, matchLoading, setMatchLoading, players,setPlayerLoading,
  setMatches, isChecked, courts}) => {
  const [editingMatch, setEditingMatch] = useState(null);
 

  /*
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const sessionDate = localStorage.getItem('Session');
        const localArea = localStorage.getItem('LocalArea');

        if (!sessionDate || !localArea) {
          console.warn('Session date or local area not found in localStorage.');
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/users/${user.email}/areas/${encodeURIComponent(localArea)}/sessions/${encodeURIComponent(sessionDate)}/inMatch`
        );

        if (response.data) {
          setInMatch(response.data || []);
        }
        setMatchLoading(false);
      } catch (error) {
        console.error('Error fetching Matches:', error);
        setMatchLoading(false);
      }
    };

    fetchMatches();
  }, [user.email, setInMatch, setMatchLoading, inMatch, selectedBall]);
 */

  useEffect(() => {
    const sessionDate = localStorage.getItem("Session");
    const localArea = localStorage.getItem("LocalArea");
  
    if (!sessionDate || !localArea || !user?.email) {
      setMatchLoading(false);
      return;
    }
  
    const encodedSessionDate = encodeURIComponent(sessionDate);
  
    const handleMatchData = (data) => {
      setMatches(data.matches);
      setInMatch(data.inMatch);
      setMatchLoading(false);
    };
  
    socket.emit("fetchMatchData", {
      userEmail: user.email,
      areaName: localArea,
      sessionDate: encodedSessionDate,
    });
  
    socket.once("matchDataFetched", handleMatchData);
  
    const timeout = setTimeout(() => {
      setMatchLoading(false); 
    }, 5000); 
  
    return () => {
      clearTimeout(timeout);
      socket.off("matchDataFetched", handleMatchData);
    };
  }, [user?.email, socket, inMatch, matches]);
  
  

  
  const capitalizeFirstLetter = (str) => {
    return str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : '';
  };

  const handleMatchUpdate = (matchId, updatedTeam1, updatedTeam2) => {
    console.log("Updating state in parent without API call");
  
    setMatches((prevMatches) =>
      prevMatches.map((m) =>
        m._id === matchId ? { ...m, team1: updatedTeam1, team2: updatedTeam2 } : m
      )
    );
  };




  const handleDeleteMatch = () => {
    setMatchLoading(true);
  
    const getEncodedStorageItem = (key) => encodeURIComponent(localStorage.getItem(key));
    const sessionDate = getEncodedStorageItem('Session');
    const localArea = getEncodedStorageItem('LocalArea');
  
    localStorage.removeItem('usedPairs');
  
    axios
      .delete(`${process.env.REACT_APP_API_URL}/users/${user.email}/areas/${localArea}/sessions/${sessionDate}/inMatch`)
      .then(() => {
        setInMatch([]);
        return axios.delete(`${process.env.REACT_APP_API_URL}/users/${user.email}/areas/${localArea}/sessions/${sessionDate}/matches`);
      })
      .then(() => {
        setMatches([]);
        setMatchLoading(false);
        Swal.fire({
          icon: 'success',
          title: 'All matches deleted successfully!',
          timer: 1200,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        console.error('Error deleting all matches:', error);
        setMatchLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error deleting all matches',
          text: error.response?.data?.message || 'Could not delete matches',
        });
      });
  };
  

  


  const handleBallSelect = (e) => {
    const value = parseInt(e.target.value, 10);
    setSelectedBall(value); 
  };
  
  useEffect(() => {
    console.log("Updated selectedBall:", selectedBall); 
  }, [selectedBall]); 
  const gameMode = localStorage.getItem('GameMode');
  
  

  const handleCourtChange = (e) => {
    setSelectedCourt(e.target.value);
  };



 

  const text = inMatch.length === 0 ? 'Matches' : `Matches - ${inMatch.length}`;
  const text2 = "No matches available";

  const goo = isChecked ? go : goBlack;

  return (
    <div className='matchMaking'>
      <TypingEffect text={text} speed={60} />
      <div className='delAll'>
        <button
          onClick={handleDeleteMatch}
          style={{ display: inMatch.length === 0 ? 'none' : 'block' }}
        >
          Delete All Matches
        </button>
      </div>
     
      {matchLoading ? (
        <GridLoader
          className='matchLoader'
          color={'#00ffffe5'}
          margin={18}
          loading={matchLoading}
          speedMultiplier={.5}
          size={20}
          width={2}
        />
      ) : inMatch.length === 0 ? (
        <TypingEffect text={text2} speed={60} />
      ) : (
        <div className='matches-container'>
          {inMatch.map((match, index) => {
            if (!match) return null;

            const court = courts && courts.find(court => court.addMatches && court?.addMatches?.some(matchC => matchC === match?._id));
            const inMatchCourt = Boolean(court);

            const team1PlayerNames = Array.isArray(players) && match.team1?.length > 0
            ? match.team1.map(playerId => {
                const player = players.find(p => p._id === playerId);
                return player
                  ? `${player.name} (${player.level || 'Unknown Level'})`
                  : 'Unknown Player (Unknown Level)';
              }).join(', ')
            : 'No players';
          
          const team2PlayerNames = Array.isArray(players) && match.team2?.length > 0
            ? match.team2.map(playerId => {
                const player = players.find(p => p._id === playerId);
                return player
                  ? `${player.name} (${player.level || 'Unknown Level'})`
                  : 'Unknown Player (Unknown Level)';
              }).join(', ')
            : 'No players';
          

            return (
              <>             
              <div key={`match_${index + 1}`} className={inMatchCourt ? 'inMatch' : 'match'}>
              {editingMatch === match._id && (
                <EditMatchForm 
                user={user} 
                match={match} 
                inMatch={inMatch}
                players={players} 
                onSave={(matchId, team1, team2) => handleMatchUpdate(matchId, team1, team2)} 
                onCancel={() => setEditingMatch(false)}
                setEditingMatch={setEditingMatch}
                setMatchLoading={setMatchLoading} 
                setPlayerLoading={setPlayerLoading}
              />
              
              )}

                <div className="team-container">
                  <h3>{match.name}</h3>
                  <h5 className={inMatchCourt ? 'in' : 'no'}>{inMatchCourt ? 'Playing' : 'Not in Court'}</h5>

                  <select
                    id={`court_${index}`}
                    name={`court_${index}`}
                    value={selectedCourt}
                    onChange={handleCourtChange}
                  >
                    <option value="" disabled>Select court</option>
                    {courts && courts.map((court, courtIndex) => (
                      <option
                        key={courtIndex}
                        value={court.name}
                        disabled={court.addMatches && court.addMatches.map(m => m.length) > 0}
                      >
                        {court.name}
                      </option>
                    ))}
                  </select>

                  <img
                    src={goo}
                    alt='go'
                    className='go'
                    onClick={(e) => handleAddMatch(e, match, selectedCourt, selectedBall, courts)} 
                  />
                  <button className='edit' onClick={() => setEditingMatch(match._id)}>Edit</button>

                  <select className="ball" value={selectedBall} onChange={handleBallSelect}>
                      <option value="" disabled>Select Ball?</option>
                      <option key="new-ball" value={1}>New Ball</option>
                      <option key="used-ball" value={0}
                      >Used Ball</option>
                  </select>

                  <div className="team1">
                    <h4 className='h4'>Team 1</h4>
                    <ul>
                      {team1PlayerNames.split(', ').map((playerInfo, idx) => {
                        const [name, level] = playerInfo.match(/^(.*?) \((.*?)\)$/)?.slice(1) || [playerInfo, 'Unknown Level'];
                        return (
                          <li key={`${match._id}_team1_${idx}`}>
                            {capitalizeFirstLetter(name)} <br /> {gameMode === "Classic" &&capitalizeFirstLetter(level)}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <p className='vs'>Vs</p>
                  

                  <div className="team2">
                    <h4 className='h4'>Team 2</h4>
                    <ul>
                      {
                      
                      team2PlayerNames.split(', ').map((playerInfo, idx) => {
                        const [name, level] = playerInfo.match(/^(.*?) \((.*?)\)$/)?.slice(1) || [playerInfo, 'Unknown Level'];
                        return (
                          <li key={`${match._id}_team2_${idx}`}>
                            {capitalizeFirstLetter(name)} <br /> {gameMode === "Classic" &&capitalizeFirstLetter(level)}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                </div>
              </div>

            </>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchMaking;



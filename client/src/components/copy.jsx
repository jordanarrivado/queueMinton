
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import go from './icons/go.png';
import flash from './icons/flash.png';
import GridLoader from "react-spinners/GridLoader";
import TypingEffect from './effects/EffectInfo';

const MatchMaking = ({ 
  user, 
  matches = [], 
  setMatches, 
  selectedCourt, 
  setSelectedCourt, 
  courts = [], 
  selectedBall, 
  setSelectedBall, 
  handleAddMatch, 
  availableBalls = [], 
  matchLoading, 
  setMatchLoading, 
  players = [] 
}) => {

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
          `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/sessions/${encodeURIComponent(sessionDate)}/matches`
        );

        if (response.data) {
          setMatches(response.data || []);
        }
        setMatchLoading(false);
      } catch (error) {
        console.error('Error fetching Matches:', error);
        setMatchLoading(false);
      }
    };

    fetchMatches();
  }, [user.email, setMatches, setMatchLoading]);

  useEffect(() => {
    if (matches.length >= 0) {
      setMatchLoading(false);
    }
  }, [matches, players, setMatchLoading]);

  const handleBallSelect = (e) => {
    const value = parseInt(e.target.value);
    setSelectedBall(value);
  };

  const handleCourtChange = (e) => {
    setSelectedCourt(e.target.value);
  };

  const text = "Matches";
  const text2 = "No matches available";

  return (
    <div className='matchMaking'>
      <TypingEffect text={text} speed={60} />
      {matchLoading ? (
        <GridLoader
          className='matchLoader'
          color={'#00ffffe5'}
          margin={18}
          loading={matchLoading}
          speedMultiplier={.9}
          size={20}
          width={2}
        />
      ) : matches.length === 0 ? (
        <TypingEffect text={text2} speed={60} />
      ) : (
        <div className='matches-container'>
          {matches.map((match, index) => {
            if (!match) return null;

            // Retrieve team player names for display
            const team1PlayerNames = match.team1.map(playerId => {
              const player = players.find(p => p._id === playerId);
              return player ? player.name : 'Unknown Player';
            }).join(', ');

            const team2PlayerNames = match.team2.map(playerId => {
              const player = players.find(p => p._id === playerId);
              return player ? player.name : 'Unknown Player';
            }).join(', ');

            return (
              <div className='matchItem' key={index}>
                <div className="match-details">
                  {/* Match Name */}
                  <h4>{match.name}</h4>

                  {/* Teams and VS Display */}
                  <div className="team">
                    <p className='team1'>{team1PlayerNames}</p>
                    <p className='vs'>vs</p>
                    <p className='team2'>{team2PlayerNames}</p>
                  </div>

                  {/* Buttons for Selecting Court and Ball */}
                  <div className="buttons">
                    <button 
                      className="select-court"
                      onClick={() => handleAddMatch(match, selectedCourt, selectedBall)}
                    >
                      <img src={go} alt="Go" />
                      Select Court
                    </button>
                    <button className="flash">
                      <img src={flash} alt="Flash" />
                      Flash
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchMaking;

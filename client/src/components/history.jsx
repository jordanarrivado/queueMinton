import React, { useState, useEffect } from 'react';
import TypingEffect from './effects/typingEffectTitle';
import CountUpEffect from './effects/countUp';
import axios from 'axios';
import DarkSearch from './icons/darkSearch.png';
import LightSearch from './icons/lightSearch.png';
import backBlack from './icons/backBlack.png';
import backLight from './icons/backLight.png';
import { FadeLoader } from 'react-spinners';

const History = ({ players, isChecked, 
  areas, user, displayPlayers, 
  totalRev,
  setTotalRev,
  setPlayers,
  setPlayerHistory,
  playerHistory,
  setDisplayPlayers, click, setClick,
  selectedAreaHistory, setSelectedAreaHistory,
  historyArea,setHistoryArea
}) => {

  const [sessionData, setSessionData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAble, setSearchAble] = useState(null);
  const [displayBack, setDisplayBack] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    const fetchArea = async () => {
      setLoading(true);
      try {
        const areas = await axios.get(
          `https://212.85.25.203:3001/users/${user.email}/areas`
        );
        const areasWithRevenue = areas.data.map((area) => {
          const totalRevenue = area.sessions.reduce((acc, session) => acc + (session.sessionRevenue || 0), 0);
          return { ...area, totalRevenue };
        });
        setHistoryArea(areasWithRevenue);
      } catch (error) {
        console.error('Error fetching areas:', error);
      } finally {
        setLoading(false); 
      }
    };
    fetchArea();
  }, [sessionData, click, displayPlayers, setPlayers, setPlayerHistory, totalRev, setTotalRev, playerHistory]);

  const handleGotoSession = async (area, session) => {
    setLoading(true); // Start loading
    try {
      const sessionResponse = await axios.get(
        `https://212.85.25.203:3001/users/${user.email}/areas/${area.name}/sessions`
      );
      setSessionData(sessionResponse.data);
      setSelectedAreaHistory(area);
      setClick('session');
    } catch (error) {
      console.error("Error fetching session on History", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleDisplayPlayers = async (area, session) => {
    if (!session || !session.sessionDate) {
      console.error('Session or session date is undefined');
      return;
    }

    setLoading(true); // Start loading
    try {
      const encodedDate = encodeURIComponent(session.sessionDate);
      const response = await axios.get(
        `https://212.85.25.203:3001/users/${user.email}/areas/${area.name}/sessions/${encodedDate}/playerHistory`
      );
      setDisplayPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players on history component:', error);
    } finally {
      setLoading(false); // Stop loading
    }
    setClick('session');
  };

  useEffect(() => {
    click === 'mainTb' ? setDisplayBack(false) : setDisplayBack(true);
  }, [sessionData, click]);

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleSearch = () => {
    setSearchAble((prev) => !prev);
    console.log(areas);
  };

  const handleBack = () => {
    if (click === 'session') {
      setClick('mainTb');
    } else if (click === 'historyPlayers') {
      setClick('session');
    }
  };

  const imgSearch = isChecked ? LightSearch : DarkSearch;
  const textArea = `${historyArea.length} - Area`;
  const textSession = `${sessionData.length} - Session `;
  const displayText = click === 'mainTb' ? textArea : textSession;

  const filteredAreas = historyArea.filter((area) =>
    area.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSessions = sessionData.filter((session) =>
    session.sessionDate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="history">
      <div className='headT'>
        <TypingEffect text={displayText} speed={80} />
        <h3>History</h3>
      </div>
      {displayBack &&
        <img src={isChecked ? backLight : backBlack} className='backIcon' onClick={handleBack} />
      }

      <div className="searchCon">
        <img src={imgSearch} alt="Search" onClick={handleSearch} 
          className={searchAble ? 'searchIcon2' : 'searchIcon'} />
        {searchAble && (
          <input
            type="text"
            placeholder={click === 'mainTb' ? 'Search Area' : 'Search Session'}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        )}
      </div>

      {loading ? (
        <div className="loader-container">
          <FadeLoader color="#36d7b7" />
        </div>
      ) : (
        <div className="table-container">
          <table className="history-table">
            {click === 'mainTb' && (
              <>
                <thead>
                  <tr>
                    <th><b>Name</b></th>
                    <th>Session</th>
                    <th>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAreas.map((area) => (
                    <tr key={area._id} onClick={() => handleGotoSession(area)}>
                      <td><b>{area.name}</b></td>
                      <td>{area.sessions.length}</td>
                      <td><CountUpEffect endValue={area.totalRevenue || 0} /></td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {click === 'session' && (
              <>
                <thead>
                  <tr>
                    <th>Mode</th>
                    <th>Session Date</th>
                    <th>Players</th>
                    <th>Matches</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr key={session._id} onClick={() => handleDisplayPlayers(selectedAreaHistory, session)}>
                      <td><b>{session.mode}</b></td>
                      <td>{session.sessionDate}</td>
                      <td>{session.playerHistory.length}</td>
                      <td>{session.matches.length}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      )}
    </div>
  );
};

export default History;

import React from "react";
import closeBtn from './icons/closeBtn.png';
import axios from "axios";
import Swal from 'sweetalert2';

const CustomMatch = ({ onShowCustom, user, onSubmit, setMatches, matches, players, inMatch, setInMatch, selectedPlayers, setSelectedPlayers,setMatchLoading, setPlayerLoading }) => {

  const handleSubmission = async () => {
    // Validate player selection
    setMatchLoading(true);
    setPlayerLoading(true);
    if (Object.values(selectedPlayers).some(player => !player)) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please select all players.',
      });
      return;
    }

    const matchData = {
      name: 'Custom Match',
      team1: [selectedPlayers.player1, selectedPlayers.player2],
      team2: [selectedPlayers.player3, selectedPlayers.player4],
    };

    const sessionDate = localStorage.getItem('Session');
    const localArea = localStorage.getItem('LocalArea');

    try {
      const encodedSessionDate = encodeURIComponent(sessionDate);
      const encodedLocalArea = encodeURIComponent(localArea);

      // Send match data to backend
      const matchResponse = await axios.put(
        `https://212.85.25.203:3001/users/${user.email}/areas/${encodedLocalArea}/sessions/${encodedSessionDate}/matches`,
        matchData
      );

      const inMatchResponse = await axios.put(
        `https://212.85.25.203:3001/users/${user.email}/areas/${encodedLocalArea}/sessions/${encodedSessionDate}/inMatch`,
        matchData
      );

      setMatches((prevMatches) => [...prevMatches, matchResponse.data]);
      setInMatch((prevInMatch) => [...prevInMatch, inMatchResponse.data]);

      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Custom Match created successfully!',
      }).then(() => {
        // Clear selected players after successful submission
        setSelectedPlayers({
          player1: '',
          player2: '',
          player3: '',
          player4: '',
        });
      });
      setMatchLoading(false);
      setPlayerLoading(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to create Custom match:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to create Custom match. Please try again.',
      });
    }
  };

  const handlePlayerSelect = (event, playerNumber) => {
    const { value } = event.target;

    if (Object.values(selectedPlayers).includes(value)) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Player already selected in another selection.',
      });
      return;
    }

    setSelectedPlayers(prevState => ({
      ...prevState,
      [playerNumber]: value,
    }));
  };

  const handleShowCustomClick = (show) => {
    onShowCustom(show);
  };

  const standByData = JSON.parse(localStorage.getItem('standBy')) || [];
  const standByPlayerIds = standByData.map(player => player.id);

  const filterPlayers = players.filter(player => 
    !inMatch.some(match => 
      Array.isArray(match.team1) && Array.isArray(match.team2) && 
      [...match.team1, ...match.team2].includes(player._id)
    ) && !standByPlayerIds.includes(player._id)
  );
  

  const renderPlayerSelect = (playerNumber) => (
    <select value={selectedPlayers[playerNumber]} onChange={(e) => handlePlayerSelect(e, playerNumber)} className="customSelect">
      <option value="" disabled>Select player</option>
      {filterPlayers.map((player) => (
        <option key={player._id} value={player._id} disabled={Object.values(selectedPlayers).includes(player._id)}>
          {player.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className="customMatch">
      <div className="cmTitle">
        <h2>Custom Match</h2>
        <img src={closeBtn} alt="Close" onClick={() => handleShowCustomClick('closed')} />
      </div>
      <div className="cmTop">
        <div className="cmTopLeft">
          {renderPlayerSelect('player1')}
          {renderPlayerSelect('player2')}
        </div>
        <div className="cmTopMid">
          <h3>Vs</h3>
        </div>
        <div className="cmTopRight">
          {renderPlayerSelect('player3')}
          {renderPlayerSelect('player4')}
        </div>
      </div>
      <div className="cmBot">
        <button onClick={handleSubmission}>Submit</button>
      </div>
    </div>
  );
};

export default CustomMatch;

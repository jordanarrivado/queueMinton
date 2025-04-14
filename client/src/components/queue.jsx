import React, { useState } from 'react';
import inlight from './icons/includeLight.png';
import inBlack from './icons/includeBlack.png';
import Swal from 'sweetalert2';

const Queue = ({ inMatch, players, forDisplay, setForDisplay, isChecked }) => {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);


  const inImg = isChecked ? inlight : inBlack;
  const capitalizeFirstLetter = (str) =>
    str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : '';

 

  const handleCheckboxChange = (id) => {
    if (selectAll) {
      setSelectedPlayers((prevSelectedPlayers) =>
        prevSelectedPlayers.filter((playerId) => playerId !== id)
      );

      if (selectedPlayers.length === players.length) {
        setSelectAll(false);
      }
    } else {
      if (selectedPlayers.includes(id)) {
        setSelectedPlayers(selectedPlayers.filter((playerId) => playerId !== id));
      } else {
        setSelectedPlayers([...selectedPlayers, id]);
      }
    }
  };

  const handleSelectAll = () => {
    
    if (selectAll) {
      setSelectedPlayers([]);
      setSelectAll(false);
    } else {
      setSelectedPlayers(filteredPlayers.map((player) => player._id));
      setSelectAll(true);
    }
  };

  const handleDeleteSelectedPlayers = async () => {
    if (selectedPlayers.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Please select players to include them in the queue!',
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Add to Queues?',
        text: 'You want to include these players to the queue again?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, include them',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        // Remove selected players from localStorage
        const standByData = JSON.parse(localStorage.getItem('standBy')) || [];
        const updatedStandByData = standByData.filter(
          (player) => !selectedPlayers.includes(player.id)
        );
     
        localStorage.setItem('standBy', JSON.stringify(updatedStandByData));

        // Update the display
        setForDisplay(updatedStandByData);
        setSelectedPlayers([]);
        setSelectAll(false);

        Swal.fire(
          'Included!',
          'Selected players have been included in the queue.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error including players:', error);
      Swal.fire('Error', 'An error occurred while including players.', 'error');
    }
  };

  
  const standByData = JSON.parse(localStorage.getItem('standBy')) || [];
  const standByPlayerIds = standByData.map(player => player.id);
  const filteredPlayers = players.filter(player =>
    standByPlayerIds.includes(player._id)
  );

  return (
    <div className="queue-container">
      <div className="top2">
        <h2>Standby - {filteredPlayers.length}</h2>
        <button 
          onClick={handleSelectAll} 
          className="selectAll">
          {selectAll ? 'Deselect' : `Select All - ${selectedPlayers.length}`}
        </button>

        <img src={inImg} alt="include" onClick={handleDeleteSelectedPlayers} className="include" />
      </div>
      <div className="table-containerQ">
        <table className="player-table2">
          <thead>
            <tr>
              <th>Name</th>
              <th>Matches</th>
              <th>Ball</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player) => (
              <tr key={player._id}>
                <td>{capitalizeFirstLetter(player.name)}</td>
                <td>{player.win + player.loss}</td>
                <td>{player.ball}</td>
                <td>
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player._id)}
                      onChange={() => handleCheckboxChange(player._id)}
                    />
                    <span className="checkmark"></span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Queue;

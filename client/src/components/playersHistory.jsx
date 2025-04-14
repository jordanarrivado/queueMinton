import React, { useState } from 'react';
import TypingEffect from './effects/EffectInfo';
import CountUpEffect from './effects/countUp';
import DarkSearch from './icons/darkSearch.png';
import LightSearch from './icons/lightSearch.png';

const PlayersHistory = ({ displayPlayers, playerHistory, isChecked }) => {
  const [searchPlayer, setSearchPlayer] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const handleSearchChange = (event) => {
    setSearchPlayer(event.target.value);
  };

  const handleSearch = () => {
    setSearchEnabled((prev) => !prev);
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
  };

  const handleClosePopup = () => {
    setSelectedPlayer(null);
  };

  const imgSearch = isChecked ? LightSearch : DarkSearch;

  const filteredPlayers = displayPlayers.filter((player) =>
    player.name.toLowerCase().includes(searchPlayer.toLowerCase())
  );

  

  return (
    <div className="playerHistory">
      {/* Popup Section */}
      {selectedPlayer && (
        <div className="popupOverlay">
          <div className="popupContent">
            <button className="closeButton" onClick={handleClosePopup}>
              &times;
            </button>
            <h3>{selectedPlayer.name}'s Transactions</h3>
            <table>
              <thead>
                <tr>
                  <th>Transaction No.</th>
                  <th>Date</th>
                  <th>Ball</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(selectedPlayer.transactions || []).map((trans, index) => (
                  <tr key={index}>
                    <td>{trans.transactionNo}</td>
                    <td>{new Date(trans.date).toLocaleString()}</td>
                    <td>{selectedPlayer.ball}</td>
                    <td>{trans.totalPaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Header Section */}
      <div className="playerHead">
        <TypingEffect
          text={`${filteredPlayers.length} - Player Records`}
          speed={100}
        />
        <div className="searchCon">
          <img
            src={imgSearch}
            alt="Search"
            title="Search Players"
            onClick={handleSearch}
            className={searchEnabled ? 'searchIcon2' : 'searchIcon'}
          />
          {searchEnabled && (
            <input
              type="text"
              placeholder="Search player"
              value={searchPlayer}
              onChange={handleSearchChange}
            />
          )}
        </div>
      </div>

      {/* Players Table */}
      <div className='phTableCon'>
        <table className='phTable'>
          <thead>
            <tr>
              <th><b>NO.</b></th>
              <th><b>NAME</b></th>
              <th>MATCHES</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player, index) => {
              const totalP = (player.transactions || []).reduce(
                (sum, trans) => sum + trans.totalPaid,
                0
              );

              return (
                <tr key={player._id} onClick={() => handlePlayerClick(player)}>
                  <td>{index + 1}</td>
                  <td>{player.name}</td>
                  <td>{player.win + player.loss}</td>
                  <td>{<CountUpEffect endValue={totalP} />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayersHistory;

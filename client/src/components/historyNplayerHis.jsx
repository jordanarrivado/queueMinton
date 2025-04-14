import React from 'react';
import History from './history';
import PlayerHistory from './playersHistory';

const HistoryNplayerHis = ({
  user,
  areas,
  click,
  totalRev,
  setPlayers,
  players,
  playerHistory,
  setPlayerHistory,
  setClick,
  isChecked,
  setDisplayPlayers,
  displayPlayers,
  historyArea,
  setHistoryArea,
  selectedAreaHistory,
  setSelectedAreaHistory
}) => {
  return (
    <div className='historyNplayerHis-wrapper'>
      <div className='history-wrapper'>
        <History
          user={user}
          areas={areas}
          click={click}
          totalRev={totalRev}
          setPlayers={setPlayers}
          players={players}
          playerHistory={playerHistory}
          setPlayerHistory={setPlayerHistory}
          setClick={setClick}
          isChecked={isChecked}
          setDisplayPlayers={setDisplayPlayers}
          displayPlayers={displayPlayers}
          historyArea={historyArea}
          setHistoryArea={setHistoryArea}
          selectedAreaHistory={selectedAreaHistory}
          setSelectedAreaHistory={setSelectedAreaHistory}
        />
      </div>

      <div className='playerHistory-wrapper'>
        {click === "session" && (
          <PlayerHistory
            selectedAreaHistory={selectedAreaHistory}
            setSelectedAreaHistory={setSelectedAreaHistory}
            displayPlayers={displayPlayers}
            setDisplayPlayers={setDisplayPlayers}
            playerHistory={playerHistory}
            setPlayerHistory={setPlayerHistory}
            isChecked={isChecked}
          />
        )}
      </div>
    </div>
  );
};

export default HistoryNplayerHis;

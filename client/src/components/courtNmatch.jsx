import React from 'react';
import MatchMaking from './matchMaking'; 
import CourtCon from './courtCon';
import ArrowBtn from "./arrowBtn";

const CourtNmatch = ({
  user,
  matches,
  setMatches,
  inMatch,
  setInMatch,
  setPlayers,
  isChecked,
  players,
  courts,
  setCourts,
  handleAddMatch,
  availableBalls,
  selectedCourt,
  setSelectedCourt,
  selectedBall,
  setSelectedBall,
  matchLoading,
  setMatchLoading,
  handleWinner,
  courtLoading,
  setCourtLoading,
  onNavigationMobile,
}) => {

  const handleClick = (component) => {
    onNavigationMobile(component);
  }
  return (
    <div className="court-wrapper">
      <ArrowBtn onNavigationMobile={() => handleClick('M&A')}/>
      <div className="matchmaking-wrapper">
        <MatchMaking
          user={user}
          matches={matches}
          setMatches={setMatches}
          inMatch={inMatch}
          setInMatch={setInMatch}
          setPlayers={setPlayers}
          isChecked={isChecked}
          players={players}
          courts={courts}
          setCourts={setCourts}
          handleAddMatch={handleAddMatch}
          availableBalls={availableBalls}
          selectedCourt={selectedCourt}
          setSelectedCourt={setSelectedCourt}
          selectedBall={selectedBall}
          setSelectedBall={setSelectedBall}
          matchLoading={matchLoading}
          setMatchLoading={setMatchLoading}
        />
      </div>

      <div className="courtcon-wrapper">
        <CourtCon
          user={user}
          isChecked={isChecked}
          selectedCourt={selectedCourt}
          inMatch={inMatch}
          setInMatch={setInMatch}
          courts={courts}
          setCourts={setCourts}
          setSelectedCourt={setSelectedCourt}
          selectedBall={selectedBall}
          setSelectedBall={setSelectedBall}
          handleWinner={handleWinner}
          courtLoading={courtLoading}
          setCourtLoading={setCourtLoading}
        />
      </div>
    </div>
  );
};

export default CourtNmatch;

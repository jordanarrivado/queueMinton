import React from 'react';
import Payment from "./payment";
import Queue from "./queue";

const PaymentNqueue = ({
  players,
  forDisplay,
  setForDisplay,
  setPlayers,
  playerHistory,
  setPlayerHistory,
  inMatch,
  totalRev,
  setTotalRev,
  user,
  courtFeeTypeDis,
  setCourtFeeTypeDis,
  areas,
  setAreas,
  isChecked,
  playerLoading,
  setPlayerLoading,
  handleWinner,
  courts,
  matches
}) => {
  return (
    <div className='paymentNqueue-wrapper'>
      <div className='payment-wrapper'>
        <Payment
          players={players}
          forDisplay={forDisplay}
          setForDisplay={setForDisplay}
          setPlayers={setPlayers}
          playerHistory={playerHistory}
          setPlayerHistory={setPlayerHistory}
          inMatch={inMatch}
          totalRev={totalRev}
          setTotalRev={setTotalRev}
          user={user}
          courtFeeTypeDis={courtFeeTypeDis}
          setCourtFeeTypeDis={setCourtFeeTypeDis}
          areas={areas}
          setAreas={setAreas}
          isChecked={isChecked}
          playerLoading={playerLoading}
          setPlayerLoading={setPlayerLoading}
        />
      </div>
      <div className='queue-wrapper'>
        <Queue
          user={user}
          isChecked={isChecked}
          handleWinner={handleWinner}
          forDisplay={forDisplay}
          setForDisplay={setForDisplay}
          courts={courts}
          players={players}
          inMatch={inMatch}
          matches={matches}
        />
      </div>
    </div>
  );
};

export default PaymentNqueue;

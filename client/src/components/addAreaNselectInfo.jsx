import React from 'react';
import AddArea from './addArea';
import SelectInfo from './selectInfo';

const AddAreaNselectInfo = ({
  user,
  areas,
  setAreas,
  selectedArea,
  setSelectedArea,
  courtFeeTypeDis,
  setCourtFeeTypeDis,
  activeComponent,
  setActiveComponent,
  handleNavigationClick,
  sessionStart,
  setSessionStart,
  sessions,
  setSessions,
  isChecked,
  setIsChecked,
  mode,
}) => {
  return (
    <div className='areaNselect-wrapper'>
      <div className='area-wrapper'>
        <AddArea
          user={user}
          areas={areas}
          setAreas={setAreas}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          courtFeeTypeDis={courtFeeTypeDis}
          setCourtFeeTypeDis={setCourtFeeTypeDis}
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
          onNavigationClick={handleNavigationClick}
        />
      </div>

      <div className='select-wrapper'>
        <SelectInfo
          user={user}
          mode={mode}
          areas={areas}
          selectedArea={selectedArea}
          courtFeeTypeDis={courtFeeTypeDis}
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
          sessionStart={sessionStart}
          setSessionStart={setSessionStart}
          sessions={sessions}
          setSessions={setSessions}
          isChecked={isChecked}
          setIsChecked={setIsChecked}
          onNavigationClick={handleNavigationClick}
        />
      </div>
    </div>
  );
};

export default AddAreaNselectInfo;

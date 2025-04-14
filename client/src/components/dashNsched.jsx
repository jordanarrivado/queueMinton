import React from 'react';
import Dashboard from './dashboard'; 
import Schedule from './schedule';

const DashNsched = ({
  user,
  areas,
  setAreas,
  isChecked,
  setIsChecked,
  schedules,
  setSchedules,
  newSchedule,
  setNewSchedule,
  historyArea,
  setHistoryArea,
}) => {
  return (
    <div className="dashNsched-wrapper">
      <div className="dash-wrapper">
        <Dashboard
          user={user}
          areas={areas}
          setAreas={setAreas}
          isChecked={isChecked}
          setIsChecked={setIsChecked}
          schedules={schedules}
          setSchedules={setSchedules}
          newSchedule={newSchedule}
          setNewSchedule={setNewSchedule}
          historyArea={historyArea}
          setHistoryArea={setHistoryArea}
        />
      </div>
      <div className="sched-wrapper">
        <Schedule
          user={user}
          areas={areas}
          setAreas={setAreas}
          isChecked={isChecked}
          setIsChecked={setIsChecked}
          schedules={schedules}
          setSchedules={setSchedules}
          newSchedule={newSchedule}
          setNewSchedule={setNewSchedule}
        />
      </div>
    </div>
  );
};

export default DashNsched;

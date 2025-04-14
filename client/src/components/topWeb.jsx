import React from 'react';
import Logo from "./top/logo";
import Title from "./top/title";
import Toggle from "./top/toggle";
import End from "./top/end";
import Account from "./top/account";

const TopWeb = ({
  mode,
  user,
  selectedArea,
  setSessions,
  sessions,
  sessionStart,
  setSessionStart,
  isChecked,
  handleToggle,
  logout,
  textCode,
  setTextCode,
  qrCode,
  setQrCode,
  selectedComponent
}) => {



  return (
    <>
      <Logo />
      <Title
        mode={mode}
        user={user}
        selectedArea={selectedArea}
        setSessions={setSessions}
        sessions={sessions}
      />

      <Toggle isChecked={isChecked} onToggle={handleToggle} />
      {selectedComponent === "allComponent" && (
        <End
          sessionStart={sessionStart}
          setSessionStart={setSessionStart}
        />
      )}
      <Account
        user={user}
        logout={logout}
        setSessionStart={setSessionStart}
        sessionStart={sessionStart}
        textCode={textCode}
        setTextCode={setTextCode}
        qrCode={qrCode}
        setQrCode={setQrCode}
      />
    </>
  )
}

export default TopWeb;

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../Css/editMatch.css";

const EditMatch = ({ user, match, players, onSave, onCancel, inMatch, setPlayerLoading, setMatchLoading, setEditingMatch }) => {
  const [editedTeam1, setEditedTeam1] = useState([...match.team1]);
  const [editedTeam2, setEditedTeam2] = useState([...match.team2]);

  const standByData = JSON.parse(localStorage.getItem('standBy')) || [];
  const standByPlayerIds = standByData.map(player => player.id);

  const filterPlayers = players.filter(player => 
      !inMatch.some(match => 
          [...match.team1, ...match.team2].includes(player._id)
      ) && !standByPlayerIds.includes(player._id) 
  );
  
  const handlePlayerChange = (team, index, value) => {
    console.log(editedTeam1);
    if (!value) return; // Prevent setting an undefined player

    const updatedTeam = [...(team === "team1" ? editedTeam1 : editedTeam2)];
    updatedTeam[index] = value;

    team === "team1" ? setEditedTeam1(updatedTeam) : setEditedTeam2(updatedTeam);
  };


  const handleSubmit = async () => {
    const sessionDate = localStorage.getItem("Session"); 
    const localArea = localStorage.getItem("LocalArea");
  
    if (!sessionDate || !localArea) {
      Swal.fire({
        icon: "error",
        title: "Missing Data",
        text: "Session or area information is missing.",
        confirmButtonText: "OK",
      });
      return;
    }
  

    if (!user?.email) {
      Swal.fire({
        icon: "error",
        title: "User Not Found",
        text: "User email is missing. Please log in again.",
        confirmButtonText: "OK",
      });
      return;
    }
  
    if (!match?._id || !editedTeam1.length || !editedTeam2.length) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Teams",
        text: "Both teams must have players before updating the match.",
        confirmButtonText: "OK",
      });
      return;
    }
  
    setPlayerLoading(true);
    setMatchLoading(true);
  
    const url = `http://212.85.25.203:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/sessions/${encodeURIComponent(sessionDate)}/inMatch/${match._id}`;
  
  
    try {
      await axios.put(url, { team1: editedTeam1, team2: editedTeam2 });
      onSave(match._id, editedTeam1, editedTeam2);
  
      setPlayerLoading(false);
      setMatchLoading(false);
      setEditingMatch(false);
      Swal.fire({
        icon: "success",
        title: "Match Updated!",
        text: "The match has been successfully updated.",
        timer: 1500,
        showConfirmButton: false,
      })
      
      
    } catch (error) {
      console.error("Failed to update match:", error);
      let errorMessage = "There was an error updating the match. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
  
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: errorMessage,
        confirmButtonText: "OK",
      });
    }
  };
  



  return (
    <div className="edit-form">
      <h3>{match.name}</h3>

      <div>
        <h4>Team 1</h4>
        {editedTeam1.map((playerId, idx) => {
          const selectedPlayer = players.find((player) => player._id === playerId);
          return (
            <select
              key={idx}
              value={playerId}
              onChange={(e) => handlePlayerChange("team1", idx, e.target.value)}
            >

              {selectedPlayer && (
                <option key={selectedPlayer._id} value={selectedPlayer._id}>
                  {selectedPlayer.name}
                </option>
              )}
              {filterPlayers.map((player) => {
                const isSelected = editedTeam1.includes(player._id) || editedTeam2.includes(player._id);
                const isCurrent = player._id === playerId;
                return (
                  <option
                    key={player._id}
                    value={player._id}
                    disabled={isSelected && !isCurrent}
                  >
                    {player.name}
                  </option>
                );
              })}
            </select>
          );
        })}
      </div>

      <div>
        <h4>Team 2</h4>
        {editedTeam2.map((playerId, idx) => {
          const selectedPlayer = players.find((player) => player._id === playerId);
          return (
            <select
              key={idx}
              value={playerId}
              onChange={(e) => handlePlayerChange("team2", idx, e.target.value)}
            >
  
              {selectedPlayer && (
                <option key={selectedPlayer._id} value={selectedPlayer._id}>
                  {selectedPlayer.name}
                </option>
              )}
              {filterPlayers.map((player) => {
                const isSelected = editedTeam1.includes(player._id) || editedTeam2.includes(player._id);
                const isCurrent = player._id === playerId; 
                return (
                  <option
                    key={player._id}
                    value={player._id}
                    disabled={isSelected && !isCurrent}
                  >
                    {player.name}
                  </option>
                );
              })}

            </select>
          );
        })}
      </div>

      <button onClick={handleSubmit}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default EditMatch;

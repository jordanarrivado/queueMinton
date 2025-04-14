import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import DelLight from './icons/delLight.png';
import DelDark from './icons/delDark.png';
import EditLight from './icons/editLight.png';
import EditDark from './icons/editDark.png';
import NotifIconLight from './icons/notifIconLight.png'
import NotifIconBlack from './icons/notifIconDark.png'
import SyncLoader from "react-spinners/SyncLoader";
import { io } from "socket.io-client";

const socket = io.connect("http://localhost:3001", {
  transports: ["websocket"], 
});


const AddPlayer = ({ players, setPlayers,reqToJoin,setReqToJoin,handleBellClick, user, isChecked, playerLoading, setPlayerLoading, inMatch }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [level, setLevel] = useState('');
  const [formattedTime, setFormattedTime] = useState('');
  //const [playerLoading, setPlayerLoading] = useState(true);

  /*
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const sessionDate = localStorage.getItem('Session');
        const localArea = localStorage.getItem('LocalArea');

        if (!sessionDate || !localArea) {
          console.warn('Session date or local area not found in localStorage.');
          return;
        }

        const response = await axios.get(
          `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/sessions/${encodeURIComponent(sessionDate)}/players`
        );

        setPlayers(response.data);
        setPlayerLoading(false);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchPlayers();
  }, [user.email, 
    setPlayers, 
    players, 
    playerLoading,
    setPlayerLoading,
    reqToJoin
  ]);
*/

useEffect(() => {
  const sessionDate = localStorage.getItem("Session");
  const localArea = localStorage.getItem("LocalArea");

  if (!sessionDate || !localArea || !user?.email) {
    setPlayerLoading(false); 
    return;
  }

  const encodedSessionDate = encodeURIComponent(sessionDate);

  const handlePlayerData = (data) => {
    setPlayers(data.playerss); 
    setPlayerLoading(false); 
  };

  socket.emit("fetchPlayers", {
    userEmail: user.email,
    areaName: localArea,
    sessionDate: encodedSessionDate,
  });

  socket.once("playerDataFetched", handlePlayerData);

  const timeout = setTimeout(() => {
    setPlayerLoading(false);  
  }, 5000);

  return () => {
    clearTimeout(timeout);
    socket.off("playerDataFetched", handlePlayerData);
  };
}, [user?.email, socket, players]); 



  const handleChange = (event) => setName(event.target.value);
  const handleGenderChange = (event) => setGender(event.target.value);
  const handleLevelChange = (event) => setLevel(event.target.value);

  useEffect(() => {
   
    const updateTime = () => {
      const currentTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
      const formatted = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric', // Added seconds for real-time effect
        hour12: true,
        timeZone: 'Asia/Manila'
      }).format(currentTime);
      setFormattedTime(formatted);
    };

    updateTime(); // Set initial time immediately
    const interval = setInterval(updateTime, 1000); 
    return () => clearInterval(interval); 
    
  }, []);



  const addPlayer = async () => {
    if (!name.trim() || !gender || !level) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Please fill in all fields!' });
      return;
    }
  
    if (
      players.some(
        (player) => typeof player.name === 'string' && player.name.toLowerCase() === name.trim().toLowerCase()
      )
    ) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Player with this name already exists!' });
      return;
    }
  
    try {
      const sessionDate = localStorage.getItem('Session');
      const localArea = localStorage.getItem('LocalArea');
  
      const response = await axios.put(
        `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/sessions/${encodeURIComponent(sessionDate)}/addPlayer`,
        { name: name.trim(), gender, level, currentTime: formattedTime}
      );
  
      setPlayers((prevPlayers) => [...prevPlayers, response.data]);
  
      setName('');
      setGender('');
      setLevel('');
  
      // Success feedback
      Swal.fire({ icon: 'success', title: 'Success!', text: 'Player added successfully!' });
    } catch (error) {
      console.error('Error adding player:', error);
  
      // Provide error feedback
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response?.data?.error || 'Failed to add player. Please try again.',
      });
    }
  };
  

  const handleEditPlayer = async (id) => {
    const updatedName = prompt('Enter the new name:');
    if (updatedName) {
      try {
        await axios.put(
          `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localStorage.getItem('LocalArea'))}/sessions/${encodeURIComponent(localStorage.getItem('Session'))}/players/${id}`,
          { name: updatedName.trim() }
        );
        await axios.put(
          `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localStorage.getItem('LocalArea'))}/sessions/${encodeURIComponent(localStorage.getItem('Session'))}/players/history/${id}`,
          { name: updatedName.trim() }
        );
        setPlayers(players.map(player => player._id === id ? { ...player, name: updatedName.trim() } : player));
      } catch (error) {
        console.error('Error updating player:', error);
        Swal.fire({ icon: 'error', title: 'Oops...', text: 'Failed to update player.' });
      }
    }
  };

  const handleDeletePlayer = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localStorage.getItem('LocalArea'))}/sessions/${encodeURIComponent(localStorage.getItem('Session'))}/players/${id}`);

      await axios.delete(`http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localStorage.getItem('LocalArea'))}/sessions/${encodeURIComponent(localStorage.getItem('Session'))}/players/history/${id}`);

      setPlayers(players.filter(player => player._id !== id));
      Swal.fire({ icon: 'success', title: 'Success!', text: 'Player deleted successfully.' });
    } catch (error) {
      console.error('Error deleting player:', error);
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Failed to delete player' });
    }
  };

  const handleDeleteAllPlayers = async () => {
    const filterPlayers = players.filter(player => 
      !inMatch.some(match => 
        [...match.team1, ...match.team2].includes(player._id)
      )
    );
  
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete All Players?',
      text: 'Are you sure you want to delete all players?',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete all',
      cancelButtonText: 'Cancel',
    });
    
    if (result.isConfirmed) {
      setPlayerLoading(true);
      try {
        localStorage.removeItem('standBy');
        localStorage.removeItem('last');
        const sessionDate = localStorage.getItem('Session');
        const localArea = localStorage.getItem('LocalArea');
  
        await axios.delete(
          `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/sessions/${encodeURIComponent(sessionDate)}/players/`
        );
  
        setPlayers([]);
        setPlayerLoading(false);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'All players deleted successfully.',
        });
      } catch (error) {
        console.error('Error deleting all players:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Error deleting all players.',
        });
      }
    }
  };
  
  

  const capitalizeFirstLetter = (str) => {
    return str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : '';
  };
  
  
  const standByData = JSON.parse(localStorage.getItem('standBy')) || [];
  const standByPlayerIds = standByData.map(player => player.id);


  const filterPlayers = Array.isArray(players) && Array.isArray(inMatch) && Array.isArray(standByPlayerIds)
  ? players.filter(player => 
      !inMatch.some(match => 
        Array.isArray(match.team1) && Array.isArray(match.team2) && 
        [...match.team1, ...match.team2].includes(player._id)
      ) && !standByPlayerIds.includes(player._id)
    )
  : [];

  
  


  const edit = isChecked ? EditLight : EditDark;
  const del = isChecked ? DelLight : DelDark;
  const loadingColor = isChecked ? '#00ffffe5' : '#1b1f4b';
  const colors = isChecked ? '' : "primary:#181818,secondary:#181818";

  const NotifIcon = isChecked ? NotifIconLight : NotifIconBlack;




  const addTenPlayers = async () => {
    const sessionDate = localStorage.getItem('Session');
    const localArea = localStorage.getItem('LocalArea');
  
    if (!sessionDate || !localArea) {
      console.warn('Session date or local area not found in localStorage.');
      return;
    }
  
    let existingPlayers = localStorage.getItem('existingPlayers')
      ? JSON.parse(localStorage.getItem('existingPlayers'))
      : [];
  
    if (players.length === 0) {
      existingPlayers = [];
      localStorage.removeItem('existingPlayers');
    }
  
    const nameGenderPool = [
      // Male Names
      { name: "James", gender: "Male" },
      { name: "John", gender: "Male" },
      { name: "Robert", gender: "Male" },
      { name: "Michael", gender: "Male" },
      { name: "William", gender: "Male" },
      { name: "David", gender: "Male" },
      { name: "Richard", gender: "Male" },
      { name: "Joseph", gender: "Male" },
      { name: "Charles", gender: "Male" },
      { name: "Christopher", gender: "Male" },
      { name: "Daniel", gender: "Male" },
      { name: "Matthew", gender: "Male" },
      { name: "Anthony", gender: "Male" },
      { name: "Donald", gender: "Male" },
      { name: "Mark", gender: "Male" },
      { name: "Paul", gender: "Male" },
      { name: "Steven", gender: "Male" },
      { name: "Andrew", gender: "Male" },
      { name: "Joshua", gender: "Male" },
      { name: "Kevin", gender: "Male" },
      { name: "Brian", gender: "Male" },
      { name: "George", gender: "Male" },
      { name: "Edward", gender: "Male" },
      { name: "Ronald", gender: "Male" },
      { name: "Timothy", gender: "Male" },
      { name: "Jason", gender: "Male" },
      { name: "Jeffrey", gender: "Male" },
      { name: "Ryan", gender: "Male" },
      { name: "Jacob", gender: "Male" },
      { name: "Gary", gender: "Male" },
      { name: "Nicholas", gender: "Male" },
      { name: "Eric", gender: "Male" },
      { name: "Stephen", gender: "Male" },
      { name: "Jonathan", gender: "Male" },
      { name: "Larry", gender: "Male" },
      { name: "Justin", gender: "Male" },
      { name: "Scott", gender: "Male" },
      { name: "Brandon", gender: "Male" },
      { name: "Benjamin", gender: "Male" },
      { name: "Samuel", gender: "Male" },
      { name: "Gregory", gender: "Male" },
      { name: "Frank", gender: "Male" },
      { name: "Alexander", gender: "Male" },
      { name: "Patrick", gender: "Male" },
      { name: "Raymond", gender: "Male" },
      { name: "Jack", gender: "Male" },
      { name: "Dennis", gender: "Male" },
      { name: "Jerry", gender: "Male" },
      { name: "Tyler", gender: "Male" },
    
      // Female Names
      { name: "Mary", gender: "Female" },
      { name: "Patricia", gender: "Female" },
      { name: "Jennifer", gender: "Female" },
      { name: "Linda", gender: "Female" },
      { name: "Elizabeth", gender: "Female" },
      { name: "Barbara", gender: "Female" },
      { name: "Susan", gender: "Female" },
      { name: "Jessica", gender: "Female" },
      { name: "Sarah", gender: "Female" },
      { name: "Karen", gender: "Female" },
      { name: "Nancy", gender: "Female" },
      { name: "Lisa", gender: "Female" },
      { name: "Margaret", gender: "Female" },
      { name: "Betty", gender: "Female" },
      { name: "Sandra", gender: "Female" },
      { name: "Ashley", gender: "Female" },
      { name: "Kimberly", gender: "Female" },
      { name: "Donna", gender: "Female" },
      { name: "Emily", gender: "Female" },
      { name: "Michelle", gender: "Female" },
      { name: "Carol", gender: "Female" },
      { name: "Amanda", gender: "Female" },
      { name: "Melissa", gender: "Female" },
      { name: "Deborah", gender: "Female" },
      { name: "Stephanie", gender: "Female" },
      { name: "Rebecca", gender: "Female" },
      { name: "Sharon", gender: "Female" },
      { name: "Cynthia", gender: "Female" },
      { name: "Kathleen", gender: "Female" },
      { name: "Amy", gender: "Female" },
      { name: "Shirley", gender: "Female" },
      { name: "Angela", gender: "Female" },
      { name: "Helen", gender: "Female" },
      { name: "Anna", gender: "Female" },
      { name: "Brenda", gender: "Female" },
      { name: "Pamela", gender: "Female" },
      { name: "Nicole", gender: "Female" },
      { name: "Emma", gender: "Female" },
      { name: "Katherine", gender: "Female" },
      { name: "Samantha", gender: "Female" },
      { name: "Christine", gender: "Female" },
      { name: "Debra", gender: "Female" },
      { name: "Rachel", gender: "Female" },
      { name: "Catherine", gender: "Female" },
      { name: "Carolyn", gender: "Female" },
      { name: "Janet", gender: "Female" },
      { name: "Heather", gender: "Female" },
      { name: "Diane", gender: "Female" }
    ];
    
    const availableNames = nameGenderPool.filter(({ name }) => !existingPlayers.includes(name));
    if (availableNames.length < 10) {
      console.warn('Not enough unique names available in the pool.');
      return;
    }
  
    const generatedPlayers = [];
    while (generatedPlayers.length < 10) {
      const randomIndex = Math.floor(Math.random() * availableNames.length);
      const { name, gender } = availableNames.splice(randomIndex, 1)[0]; 
  
      generatedPlayers.push({
        name: name,
        gender: gender,
        level: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)], 
      });
  
      existingPlayers.push(name); 
    }
  
    localStorage.setItem('existingPlayers', JSON.stringify(existingPlayers));
  
    try {
      setPlayerLoading(true);
  
      const response = await axios.put(
        `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/sessions/${encodeURIComponent(sessionDate)}/bulkAddPlayers`,
        { players: generatedPlayers, currentTime: formattedTime }
      );
  
      setPlayers((prevPlayers) => [...prevPlayers, ...response.data]);
      Swal.fire({ icon: 'success', title: 'Success!', text: '10 Players added successfully!' });
    } catch (error) {
      console.error('Error adding players:', error);
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Failed to add players. Please try again.' });
    } finally {
      setPlayerLoading(false);
    }
  };

  const gameMode = localStorage.getItem('GameMode');


  return (
    <div className="add-player-container">
      {playerLoading ? (
        <div className='playerLoader'>
          <SyncLoader color={loadingColor} margin={7} size={15} speedMultiplier={0.9} />
        </div>
      ) : (
        <>
          <div className='addPlayerHead'>
            <h2>List - {filterPlayers.length}</h2>
            <button onClick={addTenPlayers} className='addTen'>Generate players</button>
            <div className='notif'>
              {/* This will now update dynamically whenever reqToJoin changes */}
              {reqToJoin?.length > 0 && <p>{reqToJoin?.length}</p>}
              
              <img 
                src={NotifIcon} 
                alt="noticIcon" 
                className='notifIcon'
                onClick={handleBellClick}
              />
            </div>

            <img
              title="Delete All?"
              src={del}
              alt="Delete?"
              onClick={handleDeleteAllPlayers}
              className="delAllPlayers"
            />
          </div>
          
          <input
            type="text"
            value={name}
            onChange={handleChange}
            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            className="add-player-input"
            placeholder="Add Player"
          />
        
          <select className="playerGender" value={gender} onChange={handleGenderChange}>
            <option value="" disabled>Gender</option>
            <option value="Male">M</option>
            <option value="Female">F</option>
            <option value="Other">Others</option>
          </select>
          <select className="playerLevel" value={level} onChange={handleLevelChange}>
            <option value="" disabled>Level</option>
            <option value="A">A - Pro</option>
            <option value="B">B - Advanced</option>
            <option value="C">C - Intermediate</option>
            <option value="D">D - Beginner</option>
          </select>
        
          <lord-icon onClick={addPlayer}
           src="https://cdn.lordicon.com/rcgrnzji.json" 
           trigger="hover" 
           colors={colors}
           stroke="bold" 
           state="hover-swirl">
          </lord-icon>
          <div className="table-container">
            <table className="player-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterPlayers.map(player => (
                  <tr key={player._id}>
                    <td>{capitalizeFirstLetter(player.name)}</td>
                    <td>{player.gender}</td>
                    <td>{player.level}</td>
                    <td className='action'>
                      <img src={edit} alt="Edit" onClick={() => handleEditPlayer(player._id)} className="edit" />
                      <img src={del} alt="Delete?" onClick={() => handleDeletePlayer(player._id)} className="del" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AddPlayer;

import React, { useState, useEffect } from 'react';
import del from './icons/del.png';
import DelDark from './icons/delDark.png';
import axios from 'axios';
import Swal from 'sweetalert2';
import SyncLoader from "react-spinners/SyncLoader";
import { io } from "socket.io-client";

const socket = io.connect(`${process.env.REACT_APP_API_URL3}`, {
  transports: ["websocket"],
});

const CourtCon = ({ user, courts, setCourts, inMatch, selectedBall, isChecked, courtLoading, handleWinner,setCourtLoading }) => {
  const [confirmationIndex, setConfirmationIndex] = useState(null);
  
  useEffect(() => {
    const localArea = localStorage.getItem("LocalArea");
  
    if (!user?.email || !localArea || !socket) {
      console.warn("Missing user, area, or socket.");
      setCourtLoading(false);
      return;
    }
  
    setCourtLoading(true);
  
    // Emit the request
    socket.emit("fetchCourts", {
      userEmail: user.email,
      areaName: localArea,
    });
  
    // Handle the response
    const handleCourtsFetched = (data) => {
      setCourts(data || []);
      setCourtLoading(false);
    };
  
    const handleError = (err) => {
      console.error("Socket error while fetching courts:", err);
      setCourtLoading(false);
    };
  
    socket.on("courtsFetched", handleCourtsFetched);
    socket.on("error", handleError);
  
    // Cleanup
    return () => {
      socket.off("courtsFetched", handleCourtsFetched);
      socket.off("error", handleError);
    };
  }, [user?.email, socket, setCourts]);
  

  const handleAddCourt = async () => {
    const localArea = encodeURIComponent(localStorage.getItem('LocalArea'));
  
    try {
      setCourtLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/${user.email}/areas/${localArea}/courts`
      );
  
      const existingCourts = response.data || [];
      const nextCourtNumber = existingCourts.length + 1;
      const newCourt = { name: `Court ${nextCourtNumber}`, matches: [] };
  
      // Add the new court directly under the area
      const addResponse = await axios.put(
        `${process.env.REACT_APP_API_URL}/users/${user.email}/areas/${localArea}/courts`,
        newCourt
      );
  
      setCourts([...existingCourts, addResponse.data]);
      setCourtLoading(false);
      Swal.fire({
        icon: 'success',
        title: `Court ${nextCourtNumber} added successfully!`,
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error adding default court:', error);
  

      Swal.fire({
        icon: 'error',
        title: 'Error adding court',
        text: error.response?.data?.message || 'Could not add court',
      });
    }
  };
  
  const handleDeleteAllCourts = async () => {
    const localArea = encodeURIComponent(localStorage.getItem('LocalArea'));
  
    try {
      setCourtLoading(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/users/${user.email}/areas/${localArea}/courts`
      );
  
      setCourts([]);
      setCourtLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'All courts deleted successfully!',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error deleting all courts:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error deleting all courts',
        text: error.response?.data?.message || 'Could not delete courts',
      });
    }
  };

  
  const handleDeleteCourt = (index) => {
    setConfirmationIndex(index);

    Swal.fire({
      title: 'Are you sure you want to delete this court?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await confirmDeleteCourt(index);
      }
    });
  };

  const confirmDeleteCourt = async (index) => {
    const localArea = encodeURIComponent(localStorage.getItem('LocalArea'));
  
    try {
      const courtToDelete = courts[index];
      if (!courtToDelete || !courtToDelete._id) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Invalid court selection',
        });
        return;
      }
      setCourtLoading(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/users/${user.email}/areas/${localArea}/courts/${courtToDelete._id}`
      );
  
      setCourts(prevCourts => prevCourts.filter((_, idx) => idx !== index));
      setCourtLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'Court deleted successfully!',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error deleting court:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error deleting court',
        text: error.response?.data?.message || 'Could not delete court',
      });
    }
  };
  
  const loadingColor = isChecked ? '#00ffffe5' : '#1b1f4b';
  const dell = isChecked ? del : DelDark;

  return (
    <div className='courtCon'>
      {courtLoading ? 
        (<div className='playerLoader'>
          <SyncLoader color={loadingColor} margin={7} size={15} speedMultiplier={0.9} />
        </div>) :
        (
          <>
            <h2 className='h2'>{courts.length === 0 ? 'Courts' : `${courts.length} - Courts`} &nbsp;</h2>
            <lord-icon
              onClick={handleAddCourt}
              src="https://cdn.lordicon.com/rcgrnzji.json"
              colors={isChecked ? '' : "primary:#181818,secondary:#181818"}
              trigger="hover"
              stroke="bold"
              state="hover-swirl"
            ></lord-icon>
            &nbsp;
            <button onClick={handleDeleteAllCourts} className='delAll'>Delete All Courts</button>
            <div className='courtContainer'>
              {courts.map((court, index) => (
                <div key={index} className={`court ${court.addMatches && court.addMatches.length > 0 ? 'has-match' : ''}`}>
                  <h3>{court.name}</h3>

                  <img
                    src={dell}
                    alt='Delete?'
                    onClick={() => handleDeleteCourt(index)}
                    className={court.addMatches?.length > 0 ? 'noneDel' : 'del'}
                  />
                  {court.addMatches && court.addMatches.map((matchID) => {

                  const matchItem = inMatch.find(mm => mm?._id === matchID);
                  const matchName = matchItem ? matchItem.name : null;
                  const matchTeam1 = matchItem ? matchItem.team1 : null;
                  const matchTeam2 = matchItem ? matchItem.team2 : null;
                  
                    return (
                      <div key={matchID}>
                        <p>{matchName}</p>
                        <button
                          onClick={() => handleWinner(
                            matchID, 
                            court, 
                            selectedBall, 
                            'team1', 
                            { team1: matchTeam1, team2: matchTeam2 }
                          )}
                          className='t1'
                        >
                          Team 1
                        </button>
                        <button
                          onClick={() => handleWinner(
                            matchID, 
                            court, 
                            selectedBall, 
                            'team2', 
                            { team1: matchTeam1, team2: matchTeam2 }
                          )}
                          className='t2'
                        >
                          Team 2
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}
    </div>
  );
};

export default CourtCon;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import FadeLoader from 'react-spinners/FadeLoader';


const Payment = ({
  user,
  areas,
  setAreas,
  players,
  setPlayers,
  playerHistory,
  setPlayerHistory,
  isChecked,
  playerLoading,
  setPlayerLoading,
  forDisplay,
  setForDisplay,
  setCourtFeeTypeDis,
  courtFeeTypeDis,
}) => {
  const [courtPrice, setCourtPrice] = useState('');
  const [ballPrice, setBallPrice] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState([]);


    useEffect(() => {
      if (user?.email) {
        fetchAreas();
      }
    }, [user]);
  
    const fetchAreas = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/users/${user.email}/areas`);
        setAreas(response.data);
      } catch (error) {
        console.error('Error fetching areas:', error);
        Swal.fire('Error', error.response?.data?.message || 'Failed to fetch areas.', 'error');
      }
    };


  useEffect(() => {
    console.log(courtFeeTypeDis);
    const fetchPrices = async () => {
      try {
        const localArea = localStorage.getItem('LocalArea');

        if (!localArea) return;

        const response = await axios.get(
          `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}`
        );

        setCourtPrice(response.data.courtFee);
        setBallPrice(response.data.ballFee);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
  }, [user.email]);

 

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setPlayerLoading(true);

        const sessionDate = localStorage.getItem('Session');
        const localArea = localStorage.getItem('LocalArea');

        if (!sessionDate || !localArea) return;

        const response = await axios.get(
          `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/sessions/${encodeURIComponent(sessionDate)}/players`
        );

        setPlayers(response.data);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setPlayerLoading(false);
      }
    };

    fetchPlayers();
  }, [user.email, setPlayers, setPlayerLoading]);


  useEffect(() => {
    const fetchPlayerHistory = async () =>{
      try{
        const sessionDate = localStorage.getItem('Session');
        const localArea = localStorage.getItem('LocalArea');
        if (!sessionDate || !localArea) return;

        const response = await axios.get(
          `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/sessions/${encodeURIComponent(sessionDate)}/playerHistory`
        );
        setPlayerHistory(response.data);

      }catch(error){
        console.error("Failed to fetch PlayerHistory: ", error);
      }
    };
    fetchPlayerHistory();
    
  },[user.email, setPlayerHistory]);




  const handlePlayerPay = async (id, name, ball) => {
    const ballTotal = Math.round(ballPrice * ball);
    const allPlayer = playerHistory.length;
    const total = courtFeeTypeDis == "Per Head" ? parseFloat(courtPrice) + ballTotal : parseFloat(courtPrice) / allPlayer + ballTotal;

    console.log(courtFeeTypeDis == "Per Hour");
    const confirmResult = await Swal.fire({
      title: 'Confirm Payment',
      html: `<b>${name}</b> needs to pay <b>${total.toFixed(2)}</b>. Proceed?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Pay',
      cancelButtonText: 'Cancel',
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const localArea = encodeURIComponent(localStorage.getItem('LocalArea'));
      const sessionDate = encodeURIComponent(localStorage.getItem('Session'));

      const API_BASE_URL = `http://localhost:3001/users/${user.email}/areas/${localArea}/sessions/${sessionDate}/players/${id}/totalPaid`;

      await axios.put(API_BASE_URL, { totalPaid: total });

      setPlayers((prevPlayers) => prevPlayers.filter((player) => player._id !== id));

      Swal.fire('Payment Successful!', `<b>${name}</b> paid <b>${total.toFixed(2)}</b>.`, 'success');
    } catch (error) {
      console.error('Payment error:', error);
      Swal.fire('Payment Failed', 'Something went wrong.', 'error');
    }
  };

  const handlePayAllSelected = async () => {
    const areaName2 = areas.map(area => area.name);

    console.log(playerHistory.length);
    const selectedFilteredPlayers = filteredPlayers.filter((p) => selectedPlayers.includes(p._id));
  
    if (selectedFilteredPlayers.length === 0) {
      Swal.fire('No Players Selected', 'Please select players to pay.', 'warning');
      return;
    }
  
    const payments = selectedFilteredPlayers.map((player) => {
      const ballTotal = Math.round(ballPrice * player.ball);
      const allPlayer = playerHistory.length;
      const totalPaid = courtFeeTypeDis == "Per Head" ? parseFloat(courtPrice) + ballTotal : parseFloat(courtPrice) / allPlayer + ballTotal;
      return { playerId: player._id, totalPaid };
    });
  
    const totalAmount = payments.reduce((sum, p) => sum + p.totalPaid, 0);
  
    const confirmResult = await Swal.fire({
      title: 'Confirm all Payment',
      html: `Total amount for selected players: <b>${totalAmount.toFixed(2)}</b>. Proceed?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Pay All',
      cancelButtonText: 'Cancel',
    });
  
    if (!confirmResult.isConfirmed) return;
  
    try {
      const localArea = encodeURIComponent(localStorage.getItem('LocalArea'));
      const sessionDate = encodeURIComponent(localStorage.getItem('Session'));
      const API_BASE_URL = `http://localhost:3001/users/${user.email}/areas/${localArea}/sessions/${sessionDate}/bulkPayment`;
  
      const response = await axios.put(API_BASE_URL, { payments });
  
      if (response.status === 200) {
        setPlayers(prevPlayers => prevPlayers.filter(p => !selectedPlayers.includes(p._id)));
        setSelectedPlayers([]);
        Swal.fire('Payment Successful!', `Paid <b>${totalAmount.toFixed(2)}</b> for selected players.`, 'success');
      } else {
        Swal.fire('Payment Failed', 'Some payments may not have processed.', 'error');
      }
    } catch (error) {
      console.error('Bulk payment error:', error);
      Swal.fire('Payment Failed', 'Something went wrong.', 'error');
    }
  };
  
  
  
  const handlePlayerSelection = (id) => {
    setSelectedPlayers((prev) =>
      prev.includes(id) ? prev.filter((playerId) => playerId !== id) : [...prev, id]
    );
  };

  const handleEditPrice = (type, event) => {
    if (type === 'court') {
      setCourtPrice(event.target.value);
    } else {
      setBallPrice(event.target.value);
    }
  };

  const handleSavePrices = async () => {
    try {
      const localArea = localStorage.getItem("LocalArea");
      console.log("LocalArea:", localArea); // Log LocalArea
      if (!localArea) return;
  
      console.log("courtFeeTypeDis:", courtFeeTypeDis); // Log selected type
      if (!courtFeeTypeDis) {
        Swal.fire("Error!", "Please Select Court type.", "error");
        return;
      }
  
      console.log("Sending PUT request to:", `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/editCourtFeeType`);
  
      const response = await axios.put(
        `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/editCourtFeeType`,
        { courtFeeType: courtFeeTypeDis }
      );
  
      console.log("Response from editCourtFeeType:", response.data);
  
      const updatePriceResponse = await axios.put(
        `http://localhost:3001/users/${user.email}/areas/${encodeURIComponent(localArea)}/updatePrices`,
        {
          courtFee: parseFloat(courtPrice),
          ballFee: parseFloat(ballPrice),
        }
      );
  
      console.log("Response from updatePrices:", updatePriceResponse.data);
  
      Swal.fire("Success!", "Prices updated successfully.", "success");
    } catch (error) {
      console.error("Error saving prices:", error);
      Swal.fire("Error", "Failed to update prices.", "error");
    }
  };
  

  const standByData = JSON.parse(localStorage.getItem('standBy')) || [];
  const standByPlayerIds = standByData.map(player => player.id);
  const filteredPlayers = players.filter(player =>
    standByPlayerIds.includes(player._id)
  );

   useEffect(() => {
      const fetchCourtType = async () => {
        const localArea = localStorage.getItem("LocalArea");
        if(localArea){
          try{
            const response = await axios.get(`http://localhost:3001/users/${user.email}/areas/${localArea}/courtFeeType`);
            setCourtFeeTypeDis(response.data.courtFeeType);
          }catch(error){
            console.error("Error fetching Court Type: ", error);
          }
        }
        else{
          console.log("No Session at the moment");
        }
      }
      if (user) {
        fetchCourtType();
      }
     
    },[user]);


  

  return (
    <div className="payment">
      {playerLoading ? (
        <div className="payment-loader">
          <FadeLoader color={isChecked ? '#00ffffe5' : '#1b1f4b'} size={14} margin={5} speed={2} />
        </div>
      ) : (
        <>
          <h2>Player Payments - {filteredPlayers.length}</h2>
          <hr />

          <div className="price-inputs">
            <div className="input-group">
              <label>Court Fee: {courtFeeTypeDis}</label>
              <div className="input-row">
                <input type="number" value={courtPrice} onChange={(e) => handleEditPrice('court', e)} placeholder="0.00" />
                <select value={courtFeeTypeDis} onChange={(e) => setCourtFeeTypeDis(e.target.value)}>
                  <option value="" disabled>Edit Court Type</option>
                  <option key="PerHour" value="Per Hour">Per Hour</option>
                  <option key="PerHead" value="Per Head">Per Head</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label>Ball Fee:</label>
              <input type="number" value={ballPrice} onChange={(e) => handleEditPrice('ball', e)} placeholder="0.00" />
            </div>
            <button onClick={handleSavePrices} className="save-prices-btn">Save</button>
          </div>


          <div className="pay-all-section">
            <button
              className="selectPay"
              onClick={() => {
                const allFilteredSelected = filteredPlayers.every((p) => selectedPlayers.includes(p._id));
                setSelectedPlayers(allFilteredSelected ? [] : filteredPlayers.map((p) => p._id));
              }}
            >
              {filteredPlayers.every((p) => selectedPlayers.includes(p._id)) ? 'Deselect All' : 'Select All'} {filteredPlayers.length}
            </button>
            <button onClick={handlePayAllSelected} className="payAll">
              Pay All Selected
            </button>
          </div>

          <table className="payment-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Name</th>
                <th>Ball</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => {
                  const ballTotal = Math.round(ballPrice * player.ball);
                  const allPlayer = playerHistory.length;
                  const total = courtFeeTypeDis === "Per Head" ? parseFloat(courtPrice) + ballTotal : (parseFloat(courtPrice) / allPlayer) + ballTotal;

                  return (
                    <tr key={player._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedPlayers.includes(player._id)}
                          onChange={() => handlePlayerSelection(player._id)}
                        />
                      </td>
                      <td>{player.name}</td>
                      <td>{player.ball}</td>
                      <td>{total}</td>
                      <td>
                        <button onClick={() => handlePlayerPay(player._id, player.name, player.ball)}>Pay Now</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5">No Players Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Payment;

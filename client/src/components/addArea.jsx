import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FadeLoader } from 'react-spinners';

const AddArea = ({ 
  onNavigationClick, 
  user,
  areas,
  setAreas, 
  setCourtFeeTypeDis,
  courtFeeTypeDis,
  setSelectedArea,
  activeComponent,
  setActiveComponent  
}) => {
  const [newArea, setNewArea] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetchAreas();
    }
  }, [user]);

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/${user.email}/areas`);
      setAreas(response.data);
    } catch (error) {
      console.error('Error fetching areas:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to fetch areas.', 'error');
    }
  };

  const capitalizeFirstLetter = (str) => {
    return str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : '';
  };

  const handleAddArea = async () => {
    if (!newArea.trim()) {
      Swal.fire("Error", "Area name is required.", "error");
      return;
    }
    if (!courtFeeTypeDis) {
      Swal.fire("Error", "Please select a court fee type.", "error");
      return;
    }
    if (areas.some((area) => area.name.toLowerCase() === newArea.toLowerCase())) {
      Swal.fire("Error", "Area name already exists.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/users/${user.email}/areas`,
        {
          name: newArea,
          courtFeeTypeDis,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setAreas((prev) => [...prev, response.data]);
      setNewArea("");
      setCourtFeeTypeDis('');
      setLoading(false);
      Swal.fire("Success!", "Area added successfully!", "success");
    } catch (error) {
      console.error("Error adding area:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to add area.", "error");
    }
  };

  const handleEditArea = async (area) => {
    const { value: newName } = await Swal.fire({
      title: 'Edit Area',
      input: 'text',
      inputLabel: 'Area Name',
      inputValue: area.name,
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      preConfirm: (value) => {
        if (!value || !value.trim()) {
          Swal.showValidationMessage('Area name is required.');
        }
        return value.trim();
      }
    });

    if (newName && newName !== area.name) {
      try {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/users/${user.email}/areas/${area._id}`, 
          { name: newName }
        );
        setAreas(prev => prev.map(a => (a._id === area._id ? response.data : a)));
        Swal.fire('Updated!', 'Area updated successfully!', 'success');
      } catch (error) {
        console.error('Error updating area:', error);
        Swal.fire('Error', error.response?.data?.message || 'Failed to update area.', 'error');
      }
    }
  };

  const handleDeleteArea = async (areaId) => {
    setLoading(true);
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/users/${user.email}/areas/${areaId}`);
      if (response.status === 200) {
        setAreas(prev => prev.filter(area => area._id !== areaId));
        Swal.fire('Deleted!', 'Area deleted successfully!', 'success');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error deleting area:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to delete area.', 'error');
    }
  };

  const handleClick = (component, area, event) => {
    if (event.target.tagName !== 'BUTTON') {
      setSelectedArea(area);
      onNavigationClick(component);
      setActiveComponent(component);
    }
  };

  return (
    loading ? (
      <div className="loader-container">
        <FadeLoader color="#36d7b7" />
      </div>
    ) : (
      <div className="crud-container">
        <div className="form-container2">
          <h3>Add New Court</h3>
          <input
            type="text"
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            placeholder="Enter Court's name"
            className="input-field"
          />
          <select value={courtFeeTypeDis} onChange={(e) => setCourtFeeTypeDis(e.target.value)}>
            <option value="" disabled>Court Type</option>
            <option key="PerHour" value="Per Hour">Per Hour</option>
            <option key="PerHead" value="Per Head">Per Head</option>
          </select>
          <button onClick={handleAddArea} className="btn-add">Add Court</button>
        </div>

        <div className="area-list">
          {areas.length === 0 ? (
            <p>No courts added yet.</p>
          ) : (
            areas.map((area) => (
              <div 
                key={area._id} 
                className={`area-item ${activeComponent === 'displayGameMode' ? 'active' : ''}`}
                onClick={(e) => handleClick('displayGameMode', area, e)}
              > 
                <h4>{capitalizeFirstLetter(area.name)}</h4>
                {area.areaImage && <img src={area.areaImage} alt={area.name} className="area-image" />}  
                <div className="btn-group">
                  <button 
                    onClick={(event) => { 
                      event.stopPropagation(); 
                      handleDeleteArea(area._id);
                    }} 
                    className="btn-delete"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={(event) => { 
                      event.stopPropagation(); 
                      handleEditArea(area);
                    }} 
                    className="btn-edit"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  );
};

export default AddArea;

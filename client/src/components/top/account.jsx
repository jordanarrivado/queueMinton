import React, { useEffect, useState } from 'react';
import defaultImg from '../icons/R.png'; 
import Swal from 'sweetalert2';
import axios from 'axios';

const Account = ({ logout, user, setSessionStart, sessionStart, textCode, setTextCode, qrCode, setQrCode }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullName, setFullName] = useState('');
  const [edit, setEdit] = useState(false);
  const [profileImage, setProfileImage] = useState(''); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    const fetchQRCode = async () => {
      if (showQRCode) {
        setShowQRCode(false);
        return;
      }
  
      setLoading(true);
      try {
        const sessionDate = localStorage.getItem('Session');
        const localArea = localStorage.getItem('LocalArea');
  
        const response = await axios.get(`https://212.85.25.203:3001/users/${user.email}/areas/${localArea}/sessions/${encodeURIComponent(sessionDate)}`);
  
        setTextCode(response.data.textCode);
        setQrCode(response.data.qrCode);
        setShowQRCode(true);
      } catch (error) {
        console.error("Error fetching QR Code:", error);
      }
      setLoading(false);
    };

    fetchQRCode();
  },[]);

  const handleShowQr = () => {
    setShowQRCode(e => !e);
  }
  

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setProfileImage(user.profileImage || defaultImg);
      setLoading(false);
    } else {
      setError('User details not available.');
      setLoading(false);
    }
  }, [user]);

  const handleImageClick = () => {
    setShowDetails((prevShowDetails) => !prevShowDetails);
  };

  const handleClickEdit = () => {
    setEdit((prevEdit) => !prevEdit);
  };

  const handleLogout = () => {
    const sessionText = sessionStart ? 'The session will end automatically if you Logout.' : 'Do you really want to log out?';
    Swal.fire({
      title: 'Are you sure?',
      text: sessionText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('Session'); 
        localStorage.removeItem('LocalArea'); 
        localStorage.removeItem('GameMode'); 
        setSessionStart(false);
        logout();
        
        Swal.fire({
          title: 'Logged Out',
          text: 'You have been successfully logged out.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
    });
  };

  const handleProfileUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      const response = await axios.put(`https://212.85.25.203:3001/profile/${user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Profile updated:', response.data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setProfileImage(URL.createObjectURL(file)); 
    }
  };

  const capitalizeFirstLetter2 = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className='account'>
      <img
        src={user.profileImage || defaultImg}
        alt={user?.fullName || ''}
        title={user.fullName}
        className="imgKo"
        width={150} 
        height={150}
        priority 
        onClick={(event) => {
          event.stopPropagation();
          handleImageClick();
        }}
      />


      {loading && <div className='loader'>Loading...</div>}
      {error && <p className='error-message'>{error}</p>}

      {showDetails && user && !loading && (
        <div className='userDetails'>
          <button onClick={handleClickEdit}>Change Profile?</button>
          {edit && (
            <div className='editProfile'>
              <label>
                Change Name:
                <input
                  type='text'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>
              <br />
              <label>
                Profile Image:
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleFileChange}
                />
              </label>
              <button onClick={handleProfileUpdate}>Save Changes</button>
            </div>
          )}

          <p>
            <strong>Name:</strong> {capitalizeFirstLetter(fullName) || 'No name available'}
          </p>
          <p>
            <strong>Email:</strong> {capitalizeFirstLetter2(user.email) || 'No email available'}
          </p>

          <button onClick={handleShowQr} style={{ padding: "10px", fontSize: "16px", cursor: "pointer" }}>
           {showQRCode ? "Hide QR Code" : "Show QR Code"}
          </button>
          {showQRCode && (
            <>
              {textCode && <p><strong>Text Code:</strong> {textCode}</p>}
              {qrCode && <img src={qrCode} alt="QR Code" style={{ marginTop: "10px", width: "200px" }} />}
            </>
          )}

          <button onClick={handleLogout} className='logout-btn'>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Account;

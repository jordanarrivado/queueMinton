import React from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./css/header.css"; 

const Header = ({ logout, user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    Swal.fire({
      title: "Logged Out",
      text: "You have been successfully logged out.",
      icon: "success",
      confirmButtonText: "OK",
    });
  };

  return (
    <header className="header">
      <h3 className="header-title">Admin Dashboard</h3>
      <div>
        <span className="header-user">Welcome, {user}</span>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

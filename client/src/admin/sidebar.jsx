import React from "react";
import "./css/sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <ul className="sidebar-menu">
        <li className="sidebar-menu-item">Dashboard</li>
        <li className="sidebar-menu-item">User Management</li>
        <li className="sidebar-menu-item">Analytics</li>
        <li className="sidebar-menu-item">Settings</li>
      </ul>
    </div>
  );
};

export default Sidebar;

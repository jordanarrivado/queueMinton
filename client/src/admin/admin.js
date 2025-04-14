import React from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import Dashboard from "./dashboard";
import { useAuth } from '../AuthContext';
import './css/admin.css';

const Admin = () => {
  const { user, logout } = useAuth();

  return (
    <div className="admin-container">
      <Sidebar className="admin-sidebar" />
      <div className="admin-content">
        <Header user={user} logout={logout} className="admin-header" />
        <main className="admin-main">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default Admin;

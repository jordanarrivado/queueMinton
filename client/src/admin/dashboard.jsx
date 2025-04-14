import React from "react";
import "./css/dashboard.css";

const Dashboard = () => {
  return (
    <div className="dash">
      <h2>Overview</h2>
      <div className="dashboard-overview">
        <Card title="Total Users" value="1,245" />
        <Card title="New Signups" value="+35%" />
        <Card title="Active Sessions" value="520" />
      </div>
      <h2 style={{ marginTop: "30px" }}>User Management</h2>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th className="dashboard-table-header">Name</th>
            <th className="dashboard-table-header">Email</th>
            <th className="dashboard-table-header">Role</th>
            <th className="dashboard-table-header">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="dashboard-table-cell">John Doe</td>
            <td className="dashboard-table-cell">john.doe@example.com</td>
            <td className="dashboard-table-cell">Admin</td>
            <td className="dashboard-table-cell">Active</td>
          </tr>
          <tr>
            <td className="dashboard-table-cell">Jane Smith</td>
            <td className="dashboard-table-cell">jane.smith@example.com</td>
            <td className="dashboard-table-cell">User</td>
            <td className="dashboard-table-cell">Inactive</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="dashboard-card">
    <h4>{title}</h4>
    <p className="dashboard-card-value">{value}</p>
  </div>
);

export default Dashboard;

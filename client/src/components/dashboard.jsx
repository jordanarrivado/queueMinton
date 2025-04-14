import React, { useState, useEffect } from "react";
import axios from "axios";
import { FadeLoader } from 'react-spinners';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Dashboard = ({ isChecked, areas,historyArea,setHistoryArea,user }) => {
  const [switchDisplay, setSwitchDisplay] = useState(false);
  const [loading, setLoading] = useState(true);

  const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  useEffect(() => {
    setLoading(true);
    const fetchArea = async () => {
      try {
        const response = await axios.get(`https://localhost:3001/users/${user.email}/areas`);
        const areasWithRevenue = response.data.map((area) => {
          const totalRevenue = area.sessions.reduce((acc, session) => acc + (session.sessionRevenue || 0), 0);
          return { ...area, name: capitalizeFirstLetter(area.name), totalRevenue };
        });
        setHistoryArea(areasWithRevenue);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching areas:', error);
      } 
    };
    fetchArea();
  }, []);
  


  const monthlyData = [
    { name: "Jan", Players: 220, Revenue: 5500 },
    { name: "Feb", Players: 250, Revenue: 6700 },
    { name: "Mar", Players: 270, Revenue: 7200 },
    { name: "Apr", Players: 310, Revenue: 8500 },
    { name: "May", Players: 340, Revenue: 9800 },
    { name: "Jun", Players: 360, Revenue: 10200 },
    { name: "Jul", Players: 400, Revenue: 12500 },
    { name: "Aug", Players: 390, Revenue: 12100 },
    { name: "Sep", Players: 370, Revenue: 11300 },
    { name: "Oct", Players: 340, Revenue: 10400 },
    { name: "Nov", Players: 320, Revenue: 9800 },
    { name: "Dec", Players: 350, Revenue: 11000 },
  ];

  const courtData = [
    { name: "Court A", Sessions: 55, Players: 210 },
    { name: "Court B", Sessions: 48, Players: 180 },
    { name: "Court C", Sessions: 52, Players: 195 },
    { name: "Court D", Sessions: 46, Players: 170 },
    { name: "Court E", Sessions: 60, Players: 230 },
    { name: "Court F", Sessions: 50, Players: 190 },
    { name: "Court G", Sessions: 42, Players: 150 },
  ];

  const lightTheme = [
    "#1b1f4b",
    "#4CAF50",
    "#f44336",
    "#2196F3",
    "#FFEB3B",
    "#9C27B0",
    "#FF9800",
    "#795548",
    "#E91E63",
    "#607D8B"
  ];
  
  const darkTheme = [
    "#00ffffe5",
    "#ff9800",
    "#ff4081",
    "#8BC34A",
    "#673AB7",
    "#FFD700",
    "#03A9F4",
    "#FF5722",
    "#CDDC39",
    "#B0BEC5"
  ];
  
  const COLORS = isChecked ? darkTheme : lightTheme;

  const handleSwitch = (e) => {
    setSwitchDisplay((e) => !e);
    /*
   console.log(historyArea);
    const sessions = historyArea.map(area => ({
      name:area.name,
      session:area.sessions.length
    }));
    console.log(sessions);
    */
  }

  const areaNsession = historyArea.map(area => {
    const totalPlayers = area.sessions.reduce((count, session) => {
      return count + (session.playerHistory?.length || 0);
    }, 0);

    return{
      name:area.name,
      session:area.sessions.length,
      totalPlayers
    }
  });
  

 
  
  return (
    <div className="dashboard">
      {/* Pie Chart Section */}
      <div className="pieChartCon">
        {loading ? 
        (<div className="loader-container">
          <FadeLoader color="#36d7b7" />
        </div>)
        :
        (<div className="pieChart">
          <div className="hd">
            <h3>Revenue Breakdown</h3>
            <p className="up">&#8593;</p>
          </div>
          <PieChart width={400} height={400}> 
            <Pie
              data={historyArea} 
              cx="50%" cy="50%" 
              innerRadius={70}  
              outerRadius={120} 
              fill="#8884d8"
              dataKey="totalRevenue"
              label
            >
              {historyArea.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </div>)}
      </div>

      {/* Graph Section */}
      <div className="bottomGraph">
        <button onClick={handleSwitch} className="btnSwitch">
          {switchDisplay ? "Show Bar Chart" : "Show Line Chart"}
        </button>

        {switchDisplay ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value / 1000}K`} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Players" stroke={COLORS[0]} strokeWidth={3} />
              <Line type="monotone" dataKey="Revenue" stroke={COLORS[1]} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={areaNsession}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="session" fill={COLORS[1]} />
              <Bar dataKey="totalPlayers" fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

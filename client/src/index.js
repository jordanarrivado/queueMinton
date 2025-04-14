import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import PacmanLoader from "react-spinners/PacmanLoader";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import App from "./App";
import Login from "./login/login";
import Admin from "./admin/admin";
import { AuthProvider, useAuth } from "./AuthContext";

const ProtectedRoute = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <PacmanLoader
          color="00ffffe5"
          speedMultiplier={2}
          size={30}
          margin={2}
        />
      </div>
    );
  }

  return user ? element : <Navigate to="/" replace />;
};

const RootComponent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && location.pathname === "/") {
      navigate("/App");
    }
  }, [user, navigate, location]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/App"
        element={<ProtectedRoute element={<App user={user} />} />}
      />
      <Route path="/admin" element={<Admin user={user} />} />
    </Routes>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <RootComponent />
      </Router>
    </AuthProvider>
  </React.StrictMode>
);

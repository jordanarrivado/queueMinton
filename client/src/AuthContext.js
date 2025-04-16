import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

const decodeToken = (token) => {
  if (!token) return { valid: false };
  const parts = token.split(".");
  if (parts.length !== 3)
    return { valid: false, error: "Invalid token structure" };

  try {
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      return { valid: false, error: "Token has expired" };
    }
    return { valid: true, data: payload };
  } catch (error) {
    return { valid: false, error: "Failed to decode token" };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    const userData = Cookies.get("userData")
      ? JSON.parse(Cookies.get("userData"))
      : null;

    const { valid, data } = decodeToken(token);

    if (valid && userData) {
      console.log("Token and user data retrieved:", token, data, userData);
      setUser({ token, ...userData });
    } else {
      Cookies.remove("token");
      Cookies.remove("userData");
      setUser(null);
    }

    setLoading(false);
  }, []);

  const login = (token, userData, navigate) => {
    const { valid, data } = decodeToken(token);

    if (valid && userData) {
      setUser({ token, ...userData });
      console.log(token, ...userData);
      console.log(token, ...userData);
      Cookies.set("token", token, {
        secure: true,
        sameSite: "None",
        expires: 7,
      });
      Cookies.set("userData", JSON.stringify(userData), {
        secure: true,
        sameSite: "None",
        expires: 7,
      });

      navigate("/App");
    } else {
      logout();
    }
  };

  // ✅ Logout function: Ensures all session data is removed
  const logout = () => {
    setUser(null);
    Cookies.remove("token");
    Cookies.remove("userData"); // Ensure userData is removed as well
  };

  // ✅ Auto-check token expiration every 5 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      const token = Cookies.get("token");
      if (token) {
        const { valid } = decodeToken(token);
        if (!valid) {
          console.log("Token expired, logging out...");
          logout();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const contextValue = { user, login, logout, loading };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

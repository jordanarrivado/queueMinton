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
  } catch {
    return { valid: false, error: "Failed to decode token" };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const validateSession = () => {
    const token = Cookies.get("token");
    const userData = Cookies.get("userData")
      ? JSON.parse(Cookies.get("userData"))
      : null;

    const { valid } = decodeToken(token);

    if (valid && userData) {
      setUser({ token, ...userData });
    } else {
      logout();
    }
  };

  useEffect(() => {
    validateSession();
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    const { valid } = decodeToken(token);

    if (valid && userData) {
      setUser({ token, ...userData });

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
    } else {
      logout();
    }
  };

  const logout = () => {
    console.log("Logging out: clearing user session.");
    setUser(null);
    Cookies.remove("token");
    Cookies.remove("userData");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const token = Cookies.get("token");
      if (token) {
        const { valid } = decodeToken(token);
        if (!valid) {
          console.log("Token expired. Logging out.");
          logout();
        }
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

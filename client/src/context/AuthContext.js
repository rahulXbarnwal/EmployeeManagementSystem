import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedIsAdmin = localStorage.getItem("isAdmin");
    const storedUserId = localStorage.getItem("userId");
    if (storedToken) {
      setToken(storedToken);
      setIsAdmin(storedIsAdmin === "true");
      setUserId(parseInt(storedUserId, 10) || null);
    }
  }, []);

  const login = (token, isAdmin, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("isAdmin", isAdmin.toString());
    localStorage.setItem("userId", userId.toString());
    setToken(token);
    setIsAdmin(isAdmin);
    setUserId(userId);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userId");
    setToken(null);
    setIsAdmin(false);
    setUserId(null);
  };

  const value = {
    token,
    isAdmin,
    userId,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

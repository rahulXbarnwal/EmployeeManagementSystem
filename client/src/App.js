import "./App.css";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminDashboard from "./components/Dashboards/AdminDashboard";
import Dashboard from "./components/Dashboards/Dashboard";
import Login from "./components/Login/Login";
import React from "react";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <AuthProvider>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/adminDashboard"
            element={
              <ProtectedRoute isAdminRequired={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAdminRequired={false}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/adminDashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

const ProtectedRoute = ({ children, isAdminRequired }) => {
  const { token, isAdmin } = useAuth();
  if (!token) {
    return <Navigate to="/" />;
  }
  if (isAdminRequired && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

export default App;

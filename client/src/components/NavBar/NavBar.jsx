import "./NavBar.css";

import { Button } from "@mui/material";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
    navigate("/");
  };

  return (
    <nav>
      <h1 className="dashboard-nav">Employee Management Dashboard</h1>
      {token && (
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          style={{
            position: "absolute",
            right: "65px",
            bottom: "0px",
            transform: "translateY(-50%)",
          }}
        >
          Logout
        </Button>
      )}
    </nav>
  );
};

export default NavBar;

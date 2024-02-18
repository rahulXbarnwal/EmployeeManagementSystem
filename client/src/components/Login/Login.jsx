import "./Login.css";

import React, { useEffect, useState } from "react";

import API from "../../API";
import ClipLoader from "react-spinners/ClipLoader";
import NavBar from "../NavBar/NavBar";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login, token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (token) {
      isAdmin ? navigate("/adminDashboard") : navigate("/dashboard");
    }
  }, [token, isAdmin, navigate]);

  const handleChange = (e) => {
    setData((data) => ({ ...data, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    if (data.email === "" || data.password === "") {
      setLoader(false);
      return toast.warn(`Fields can't be empty!`, {
        position: "bottom-right",
      });
    }
    try {
      const response = await axios.post(API.loginEmployee, data);
      const token = response.data.token;
      if (response.data.employee.isActive) {
        const isAdmin = response.data.isAdmin;
        const userId = response.data.employee.id;
        login(token, isAdmin, userId);
        isAdmin ? navigate("/adminDashboard") : navigate("/dashboard");
      } else {
        toast.error(`Employee is Inactive!`, {
          position: "bottom-right",
        });
        navigate("/");
        setLoader(false);
        return;
      }
      toast.success(`LoggedIn Successfully!`, {
        position: "bottom-right",
      });
    } catch (error) {
      toast.error(`Error Occurred: ${error?.response?.data}`, {
        position: "bottom-right",
      });
    }
    setLoader(false);
  };

  return (
    <div className="main-container">
      <NavBar />
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 style={{ textAlign: "center" }}>Login</h2>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email"
              value={data.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              value={data.password}
              onChange={handleChange}
              required
            />
          </div>
          {loader && (
            <button type="submit" disabled={true}>
              <center>
                <ClipLoader color="white" size={25} />
              </center>
            </button>
          )}
          {!loader && <button type="submit">Login</button>}
        </form>
      </div>
    </div>
  );
}

export default Login;

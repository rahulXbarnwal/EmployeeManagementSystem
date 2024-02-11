import "./Login.css";

import React, { useState } from "react";

import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setData((data) => ({ ...data, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    if (data.email === "" || data.password === "") {
      toast.warn(`Fields can't be empty!`, {
        position: "bottom-right",
      });
    } else if (
      data.email === "admin@gmail.com" &&
      data.password === "123456789"
    ) {
      localStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);
      navigate("/dashboard");
      toast.success(`LoggedIn Successfully!`, {
        position: "bottom-right",
      });
    } else {
      toast.error(`Wrong Credentials!`, {
        position: "bottom-right",
      });
    }
    setLoader(false);
  };

  return (
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
  );
}

export default Login;

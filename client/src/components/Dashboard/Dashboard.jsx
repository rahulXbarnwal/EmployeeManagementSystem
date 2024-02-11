import "./Dashboard.css";

import { Box, Button } from "@mui/material";
import React, { useEffect, useState } from "react";

import API from "../../API";
import AddEmployeeModal from "../Modals/AddEmployeeModal";
import { DataGrid } from "@mui/x-data-grid";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import EditEmployeeModal from "../Modals/EditEmployeeModal";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [employeeData, setEmployeeData] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const navigate = useNavigate();

  const fetchEmployeesData = async () => {
    try {
      const response = await axios.get(API.getAllEmployees);
      setEmployeeData(response.data);
    } catch (error) {
      console.error("Failed to fetch employee data:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
    fetchEmployeesData();
  }, [isAuthenticated, navigate]);

  const handleAddEmployee = () => {
    setIsAddModalOpen(true);
  };

  const handleEdit = (id) => {
    const employee = employeeData.find((emp) => emp.id === id);
    setCurrentEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedEmployeeId(id);
    setIsDeleteModalOpen(true);
  };

  const handleClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentEmployee(null);
    setSelectedEmployeeId(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "department", headerName: "Department", flex: 0.7 },
    { field: "title", headerName: "Title", flex: 0.6 },
    { field: "phone", headerName: "Phone", flex: 0.8 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "salary", headerName: "Salary", flex: 0.6 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.9,
      sortable: false,
      renderCell: (params) => (
        <div className="action-buttons">
          <button onClick={() => handleEdit(params.id)}>Edit</button>
          <button onClick={() => handleDelete(params.id)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      <AddEmployeeModal
        open={isAddModalOpen}
        onClose={handleClose}
        fetchEmployees={fetchEmployeesData}
      />
      <EditEmployeeModal
        open={isEditModalOpen}
        onClose={handleClose}
        employee={currentEmployee}
        fetchEmployees={fetchEmployeesData}
      />
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={handleClose}
        employeeId={selectedEmployeeId}
        fetchEmployees={fetchEmployeesData}
      />
      <nav>
        <h1 className="dashboard-nav">Employee Management Dashboard</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddEmployee}
          style={{ margin: "5px 20px" }}
        >
          Add Employee
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          style={{
            position: "absolute",
            right: "65px",
            transform: "translateY(-50%)",
          }}
        >
          Logout
        </Button>
      </nav>
      {employeeData.length > 0 ? (
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={employeeData}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
          />
        </Box>
      ) : (
        <p>
          No employee data available. Please check if the API is returning data
          correctly.
        </p>
      )}
    </div>
  );
};

export default Dashboard;

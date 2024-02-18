import "./AdminDashboard.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { Box, Button, IconButton, Switch } from "@mui/material";
import React, { useEffect, useState } from "react";

import API from "../../API";
import AddEmployeeModal from "../Modals/AddEmployeeModal";
import { DataGrid } from "@mui/x-data-grid";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import DocumentsModal from "../Modals/DocumentsModal";
import EditEmployeeModal from "../Modals/EditEmployeeModal";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import NavBar from "../NavBar/NavBar";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [isDocsModelOpen, setIsDocsModelOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const navigate = useNavigate();

  const fetchEmployeesData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API.getAllEmployees, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployeeData(response.data);
    } catch (error) {
      console.error("Failed to fetch employee data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesData();
  }, [token, navigate, logout]);

  const handleAddEmployee = () => {
    setIsAddModalOpen(true);
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const newIsActive = !isActive;
      const response = await axios.patch(
        `${API.updateEmployee}/${id}`,
        [
          {
            op: "replace",
            path: `/isActive`,
            value: newIsActive,
          },
        ],
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        console.log(`Successfully updated active status for employee ${id}`);
        setEmployeeData(
          employeeData.map((emp) =>
            emp.id === id ? { ...emp, isActive: newIsActive } : emp
          )
        );
      } else {
        console.error("Failed to update employee status:", response);
      }
    } catch (error) {
      console.error("Error updating employee status:", error);
    }
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

  const handleOpenDocumentsModal = (id) => {
    const employee = employeeData.find((emp) => emp.id === id);
    setCurrentEmployee(employee);
    setIsDocsModelOpen(true);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "name", headerName: "Name", flex: 0.8 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "department", headerName: "Department", flex: 0.6 },
    { field: "title", headerName: "Title", flex: 0.6 },
    { field: "phone", headerName: "Phone", flex: 0.6 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "salary", headerName: "Salary", flex: 0.5 },
    {
      field: "documents",
      headerName: "Docs",
      flex: 0.35,
      renderCell: (params) => (
        <IconButton onClick={() => handleOpenDocumentsModal(params.id)}>
          <FolderSharedIcon />
        </IconButton>
      ),
    },
    {
      field: "isActive",
      headerName: "Active",
      flex: 0.45,
      renderCell: (params) => (
        <Switch
          checked={params.row.isActive}
          onChange={() => handleToggleActive(params.id, params.row.isActive)}
          color="primary"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.64,
      sortable: false,
      renderCell: (params) => (
        <div className="action-buttons">
          <button
            onClick={() => handleEdit(params.id)}
            className="action-button"
          >
            <i className="fa fa-edit"></i>
          </button>
          <button
            onClick={() => handleDelete(params.id)}
            className="action-button"
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      <DocumentsModal
        open={isDocsModelOpen}
        onClose={() => setIsDocsModelOpen(false)}
        employeeId={currentEmployee?.id}
        token={token}
      />
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
      <NavBar />
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddEmployee}
        style={{ margin: "10px 0", width: "15%" }}
      >
        Add Employee
      </Button>
      {isLoading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : employeeData.length > 0 ? (
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

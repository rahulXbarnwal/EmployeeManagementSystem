import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import API from "../../API";
import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const DeleteConfirmationModal = ({
  open,
  onClose,
  employeeId,
  fetchEmployees,
}) => {
  const { token } = useAuth();
  const handleDelete = async () => {
    try {
      await axios.delete(`${API.deleteEmployee}/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Employee deleted successfully", {
        position: "bottom-right",
      });
      fetchEmployees();
    } catch (error) {
      console.log(error);
      toast.error(`Error Occurred`, {
        position: "bottom-right",
      });
    } finally {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this employee's data?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleDelete} color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationModal;

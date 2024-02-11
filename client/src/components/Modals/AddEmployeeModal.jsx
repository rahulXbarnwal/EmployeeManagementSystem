import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React, { useState } from "react";

import API from "../../API";
import axios from "axios";
import { toast } from "react-toastify";

const AddEmployeeModal = ({ open, onClose, fetchEmployees }) => {
  const initialFormData = {
    name: "",
    email: "",
    department: "",
    title: "",
    phone: "",
    address: "",
    salary: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.name = formData.name ? "" : "This field is required.";
    tempErrors.email = formData.email ? "" : "This field is required.";
    tempErrors.department = formData.department
      ? ""
      : "This field is required.";
    tempErrors.title = formData.title ? "" : "This field is required.";
    tempErrors.phone = formData.phone ? "" : "This field is required.";
    tempErrors.address = formData.address ? "" : "This field is required.";
    tempErrors.salary = formData.salary ? "" : "This field is required.";
    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        const response = await axios.post(API.addEmployee, formData);
        if (response.status === 201) {
          toast.success("Employee Details Added!", {
            position: "bottom-right",
          });
          fetchEmployees();
          handleClose();
        } else {
          toast.error(`Unexpected response status: ${response.status}`, {
            position: "bottom-right",
          });
        }
      } catch (error) {
        toast.error("Failed to save employee", {
          position: "bottom-right",
        });
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Employee</DialogTitle>
      <DialogContent>
        {Object.keys(formData).map((key) => (
          <TextField
            key={key}
            autoFocus={key === "name"}
            margin="dense"
            id={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            type="text"
            fullWidth
            variant="standard"
            value={formData[key]}
            onChange={handleChange}
            error={!!errors[key]}
            helperText={errors[key]}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEmployeeModal;

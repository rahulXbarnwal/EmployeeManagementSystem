import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import API from "../../API";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const EditEmployeeModal = ({ open, onClose, employee, fetchEmployees }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    title: "",
    phone: "",
    address: "",
    salary: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      const { id, isActive, ...rest } = employee;
      setFormData(rest);
    }
  }, [employee]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const createJsonPatchDocument = (formData) => {
    const patchDocument = [];

    for (const key in formData) {
      if (formData[key] !== "") {
        patchDocument.push({
          op: "replace",
          path: `/${key}`,
          value: formData[key],
        });
      }
    }

    return patchDocument;
  };

  const handleSave = async () => {
    if (validateForm()) {
      const patchDocument = createJsonPatchDocument(formData);
      try {
        const response = await axios.patch(
          `${API.updateEmployee}/${employee.id}`,
          patchDocument,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          toast.success("Employee details updated successfully.", {
            position: "bottom-right",
          });
          fetchEmployees();
        } else {
          toast.error(`Unexpected error occurred: ${response.status}`, {
            position: "bottom-right",
          });
        }
      } catch (error) {
        console.log(error);
        toast.error(`Error Occurred`, {
          position: "bottom-right",
        });
      }
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Employee</DialogTitle>
      <DialogContent>
        {Object.keys(formData).map((key) => (
          <TextField
            key={key}
            autoFocus={key === "name"}
            margin="dense"
            name={key}
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
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEmployeeModal;

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Input,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import API from "../../API";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { PulseLoader } from "react-spinners";
import RemoveCircleOutlinedIcon from "@mui/icons-material/RemoveCircleOutlined";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const initialEmployeeData = {
  name: "",
  email: "",
  department: "",
  title: "",
  phone: "",
  address: "",
  salary: "",
};
const initialQualification = {
  qualificationName: "",
  institution: "",
  stream: "",
  yearOfPassing: "",
  percentage: "",
};
const initialDocument = { file: null, fileName: "", remarks: "" };
const QUALIFICATION_FIELDS = [
  "qualificationName",
  "institution",
  "stream",
  "yearOfPassing",
  "percentage",
];

const AddEmployeeModal = ({ open, onClose, fetchEmployees }) => {
  const { token } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState(initialEmployeeData);
  const [qualifications, setQualifications] = useState([initialQualification]);
  const [documents, setDocuments] = useState([initialDocument]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setEmployeeData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleQualificationChange = (index, e) => {
    const newQualifications = qualifications.map((qualification, i) => {
      if (i === index) {
        return { ...qualification, [e.target.name]: e.target.value };
      }
      return qualification;
    });
    setQualifications(newQualifications);
  };

  const handleDocumentChange = (index, event) => {
    const { name, value, files } = event.target;
    let newDocuments = [...documents];

    if (files) {
      newDocuments[index] = {
        ...newDocuments[index],
        file: files[0],
        fileName: files[0].name,
      };
    } else {
      newDocuments[index] = { ...newDocuments[index], [name]: value };
    }

    setDocuments(newDocuments);
  };

  const areAllEmployeeFieldsFilled = () => {
    return Object.values(employeeData).every((value) => value);
  };
  const areAllQualificationsFilled = () => {
    return qualifications.every((qualification) =>
      Object.values(qualification).every((value) => value.trim() !== "")
    );
  };
  const areAllDocumentsFilled = () => {
    return documents.every(
      (document) => document.file && document.remarks.trim() !== ""
    );
  };

  const addQualification = () => {
    setQualifications([
      ...qualifications,
      {
        qualificationName: "",
        institution: "",
        stream: "",
        yearOfPassing: "",
        percentage: "",
      },
    ]);
  };

  const removeQualification = (index) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const addDocument = () => {
    setDocuments([...documents, { file: null, fileName: "", remarks: "" }]);
  };

  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setEmployeeData(initialEmployeeData);
    setQualifications([initialQualification]);
    setDocuments([initialDocument]);
  };

  const handleClose = () => {
    onClose();
    resetForm();
    setStep(1);
  };

  const handleSave = async () => {
    if (step === 3 && !areAllDocumentsFilled()) {
      toast.error("Please fill out all fields before continuing.", {
        position: "bottom-right",
      });
      return;
    }

    const formData = new FormData();
    documents.forEach((doc, index) => {
      formData.append("files", doc.file);
    });
    const remarks = documents.map((doc) => ({ Remark: doc.remarks }));
    formData.append("remarksJson", JSON.stringify(remarks));

    setIsLoading(true);
    try {
      const HEADERS = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response1 = await axios.post(
        API.addEmployee,
        employeeData,
        HEADERS
      );
      const employeeId = response1.data.id;
      await axios.post(
        `${API.addQualifications}/${employeeId}`,
        qualifications,
        HEADERS
      );
      await axios.post(`${API.addDocuments}/${employeeId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Employee Details Added!", {
        position: "bottom-right",
      });
      fetchEmployees();
      handleClose();
    } catch (error) {
      toast.error(`Error Occurred: ${error?.response?.data}`, {
        position: "bottom-right",
      });
    }
    setIsLoading(false);
  };

  const handleContinue = () => {
    if (
      (step === 1 && !areAllEmployeeFieldsFilled()) ||
      (step === 2 && !areAllQualificationsFilled())
    ) {
      toast.error("Please fill out all fields before continuing.", {
        position: "bottom-right",
      });
      return;
    }
    setStep((step) => step + 1);
  };

  const handleBack = () => {
    setStep((step) => step - 1);
  };

  const renderEmployeeForm = () => (
    <>
      {Object.entries(employeeData).map(([key, value]) => (
        <TextField
          key={key}
          id={key}
          margin="dense"
          name={key}
          label={key.charAt(0).toUpperCase() + key.slice(1)}
          type="text"
          fullWidth
          variant="standard"
          value={value}
          onChange={handleChange}
        />
      ))}
    </>
  );

  const renderQualificationsForm = () => (
    <>
      {qualifications.map((qualification, index) => (
        <Box
          key={index}
          display="block"
          alignItems="center"
          justifyContent="space-between"
        >
          {QUALIFICATION_FIELDS.map((field) => (
            <TextField
              key={field}
              margin="dense"
              id={field}
              name={field}
              label={
                field.charAt(0).toUpperCase() +
                field
                  .slice(1)
                  .replace(/([A-Z])/g, " $1")
                  .trim()
              }
              type="text"
              fullWidth
              variant="standard"
              value={qualification[field]}
              onChange={(e) => handleQualificationChange(index, e)}
              style={{ flexGrow: 1, marginRight: 8 }}
            />
          ))}
          {qualifications.length > 1 && (
            <IconButton
              onClick={() => removeQualification(index)}
              aria-label="Remove qualification"
            >
              <RemoveCircleOutlinedIcon />
            </IconButton>
          )}
        </Box>
      ))}
    </>
  );

  const renderDocumentForm = () => (
    <>
      {documents.map((document, index) => (
        <Box
          key={index}
          sx={{ display: "flex", alignItems: "center", mt: 2, gap: 2 }}
        >
          <label htmlFor={`file-upload-${index}`}>
            <Input
              sx={{ display: "none" }}
              id={`file-upload-${index}`}
              name="file"
              type="file"
              onChange={(e) => handleDocumentChange(index, e)}
            />
            <Button
              variant="contained"
              component="span"
              startIcon={<FileUploadIcon />}
              sx={{ mt: 1 }}
            >
              Upload
            </Button>
          </label>
          {document.fileName && (
            <Typography variant="body2" sx={{ flexGrow: 1, marginTop: 2 }}>
              {document.fileName}
            </Typography>
          )}
          <TextField
            name="remarks"
            label="Remarks"
            variant="standard"
            value={document.remarks}
            onChange={(e) => handleDocumentChange(index, e)}
            sx={{ mr: 2 }}
            fullWidth
          />
          {documents.length > 1 && (
            <IconButton
              onClick={() => removeDocument(index)}
              aria-label="Remove document"
            >
              <RemoveCircleOutlinedIcon />
            </IconButton>
          )}
          {index === documents.length - 1 && (
            <IconButton onClick={addDocument} aria-label="Add document">
              <AddCircleOutlinedIcon />
            </IconButton>
          )}
        </Box>
      ))}
    </>
  );

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        {step === 1
          ? "Employee Details"
          : step === 2
          ? "Qualification Details"
          : "Documents"}
      </DialogTitle>
      <DialogContent>
        {step === 1
          ? renderEmployeeForm()
          : step === 2
          ? renderQualificationsForm()
          : renderDocumentForm()}
      </DialogContent>
      <DialogActions>
        <Box flexGrow={1}>
          <Button onClick={handleClose} color="error">
            Cancel
          </Button>
        </Box>
        <Box>
          {step === 2 && (
            <Button onClick={addQualification} aria-label="Add qualification">
              <AddCircleOutlinedIcon />
            </Button>
          )}
          {step > 1 && <Button onClick={handleBack}>Back</Button>}
          {step < 3 && (
            <Button onClick={handleContinue} color="primary">
              Continue
            </Button>
          )}
          {step === 3 &&
            (!isLoading ? (
              <Button onClick={handleSave} color="primary">
                Submit
              </Button>
            ) : (
              <Button color="primary">
                <center>
                  <PulseLoader color="#465ed9" size={10} />
                </center>
              </Button>
            ))}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddEmployeeModal;

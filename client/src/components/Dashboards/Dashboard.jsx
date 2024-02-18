import "./Dashboard.css";

import {
  Box,
  CircularProgress,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import API from "../../API";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const drawerWidth = 240;

const Dashboard = () => {
  const { token, userId, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedEmployeeDetails, setFetchedEmployeeDetails] = useState({});
  const [qualificationDetails, setQualificationDetails] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [previewDocUrl, setPreviewDocUrl] = useState("");
  const [previewDocType, setPreviewDocType] = useState("");

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      let url = "";
      switch (selectedTab) {
        case "details":
          url = `${API.getEmployee}/${userId}`;
          break;
        case "qualifications":
          url = `${API.getQualificationsOfAnEmployee}/${userId}`;
          break;
        case "documents":
          url = `${API.getAllDocsOfAnEmployee}/${userId}`;
          break;
        default:
          setIsLoading(false);
          return;
      }

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (selectedTab === "details") setFetchedEmployeeDetails(response.data);
        else if (selectedTab === "qualifications")
          setQualificationDetails(response.data);
        else if (selectedTab === "documents") setDocuments(response.data);
      } catch (error) {
        toast.error(`Error fetching ${selectedTab}: ${error.message}`, {
          position: "bottom-right",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedTab, token, userId]);

  const handlePreview = async (docId, contentType) => {
    try {
      const response = await axios.get(`${API.previewDocument}/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const blobUrl = URL.createObjectURL(
        new Blob([response.data], { type: contentType })
      );
      setPreviewDocUrl(blobUrl);
      setPreviewDocType(contentType);
    } catch (error) {
      console.error("Error fetching document for preview:", error);
      toast.error("Failed to load document for preview.");
    }
  };

  const renderEmployeeDetails = () => (
    <div className="dashboard-form-fields">
      {Object.entries(fetchedEmployeeDetails).map(([key, value], index) => (
        <TextField
          key={index}
          label={key.charAt(0).toUpperCase() + key.slice(1)}
          value={value || ""}
          variant="outlined"
          fullWidth
          InputProps={{ readOnly: true }}
          className="dashboard-form-field"
        />
      ))}
    </div>
  );

  const renderQualifications = () => (
    <div className="dashboard-qualifications-grid">
      {qualificationDetails.map((qual, index) => (
        <div key={index} className="dashboard-qualification-card">
          {Object.entries(qual).map(([key, value]) => (
            <TextField
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              value={value || ""}
              variant="outlined"
              fullWidth
              InputProps={{ readOnly: true }}
              className="dashboard-form-field"
            />
          ))}
        </div>
      ))}
    </div>
  );

  const renderDocuments = () => (
    <>
      <Modal
        open={!!previewDocUrl}
        onClose={() => setPreviewDocUrl("")}
        aria-labelledby="preview-modal-title"
        aria-describedby="preview-modal-description"
      >
        <Box
          sx={{
            ...style,
            width: 600,
            height: 500,
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {previewDocType === "application/pdf" && (
            <iframe
              src={previewDocUrl}
              title="Document Preview"
              style={{ width: "100%", height: "100%" }}
              frameBorder="0"
            ></iframe>
          )}
          {["image/jpeg", "image/png"].includes(previewDocType) && (
            <img
              src={previewDocUrl}
              alt="Document Preview"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          )}
        </Box>
      </Modal>
      {documents.map((doc, index) => (
        <Box key={index} className="dashboard-document-item">
          <Typography className="dashboard-document-name">
            {index + 1}
          </Typography>
          <Typography className="dashboard-document-name">
            {doc.documentName}
          </Typography>
          <IconButton
            onClick={() => handlePreview(doc.documentId, doc.contentType)}
          >
            <VisibilityIcon />
          </IconButton>
        </Box>
      ))}
    </>
  );

  const renderContent = () => {
    if (isLoading) {
      return <CircularProgress className="dashboard-loading" />;
    }

    switch (selectedTab) {
      case "details":
        return renderEmployeeDetails();
      case "qualifications":
        return renderQualifications();
      case "documents":
        return renderDocuments();
      default:
        return <Typography>Select an option</Typography>;
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <CssBaseline />
      <Box className="dashboard-root">
        <Drawer
          className="dashboard-drawer"
          variant="permanent"
          classes={{ paper: "dashboard-drawer-paper" }}
          style={{ width: drawerWidth }}
        >
          <Typography variant="h6" className="dashboard-heading">
            Employee Dashboard
          </Typography>
          <Box className="drawer-container">
            <List>
              {["details", "qualifications", "documents"].map((text) => (
                <ListItem
                  button
                  key={text}
                  onClick={() => setSelectedTab(text)}
                  className="dashboard-list-item"
                >
                  <ListItemText
                    primary={text.charAt(0).toUpperCase() + text.slice(1)}
                  />
                </ListItem>
              ))}
              <Divider />
            </List>
            <Box className="logout-section">
              <Divider />
              <ListItem onClick={handleLogout} className="logout">
                <ExitToAppIcon
                  className="logout-icon"
                  style={{ marginRight: "10px" }}
                />
                <ListItemText primary="Logout" />
              </ListItem>
            </Box>
          </Box>
        </Drawer>

        <Box component="main" className="dashboard-main">
          <Typography variant="h4" className="dashboard-content-header">
            {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
          </Typography>
          <Box className="dashboard-content-box">{renderContent()}</Box>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;

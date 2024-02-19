import {
  Box,
  CircularProgress,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import API from "../../API";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { toast } from "react-toastify";

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

const DocumentsModal = ({ open, onClose, employeeId, token }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [previewDocUrl, setPreviewDocUrl] = useState("");
  const [previewDocType, setPreviewDocType] = useState("");

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API.getAllDocsOfAnEmployee}/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDocuments(response.data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to fetch documents.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDocuments();
    }
  }, [open, employeeId, token]);

  const handleDownload = async (docId, documentName, contentType) => {
    try {
      const response = await axios.get(`${API.downloadDocument}/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: contentType })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", documentName);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      return toast.error(`Error downloading document!`, {
        position: "bottom-right",
      });
    }
  };

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

  const handleDelete = async (docId) => {
    try {
      await axios.delete(`${API.deleteDocument}/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const newDocuments = documents.filter((doc) => doc.documentId != docId);
      setDocuments(newDocuments);
      fetchDocuments();
      return toast.success(`Document deleted successfully!`, {
        position: "bottom-right",
      });
    } catch (error) {
      return toast.error(`Error deleting document!`, {
        position: "bottom-right",
      });
    }
  };

  return (
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

      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="document-modal-title"
        aria-describedby="document-modal-description"
      >
        <Box sx={style}>
          <Typography id="document-modal-title" variant="h6" component="h2">
            Employee Documents
          </Typography>
          {isLoading ? (
            <CircularProgress />
          ) : documents.length ? (
            documents.map((doc, index) => (
              <Box
                key={doc.documentId}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography>{`${index + 1}. ${doc.remarks}`}</Typography>
                <div>
                  <IconButton
                    onClick={() =>
                      handlePreview(doc.documentId, doc.contentType)
                    }
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      handleDownload(
                        doc.documentId,
                        doc.documentName,
                        doc.contentType
                      )
                    }
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(doc.documentId)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              </Box>
            ))
          ) : (
            "No Documents Added!"
          )}
        </Box>
      </Modal>
    </>
  );
};

export default DocumentsModal;

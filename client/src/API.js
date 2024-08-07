// const url = "http://localhost:5136/api";
const url = "https://employeemanagementsystem-k27a.onrender.com/api";

const API = {
  registerAdmin: url + "/Auth/register",
  loginEmployee: url + "/Auth/login",
  getAllEmployees: url + "/Employee/All",
  getEmployee: url + "/Employee",
  getEmployeeByEmail: url + "/Employee/ByEmail",
  updateEmployee: url + "/Employee",
  deleteEmployee: url + "/Employee",
  addEmployee: url + "/Employee",
  addQualifications: url + "/Qualifications/Employee",
  addDocuments: url + "/Documents/Upload",
  getAllDocsOfAnEmployee: url + "/Documents/Employee",
  downloadDocument: url + "/Documents/DownloadDocument",
  previewDocument: url + "/Documents/View",
  deleteDocument: url + "/Documents",
  getQualificationsOfAnEmployee: url + "/Qualifications/Employee",
  deleteQualifications: url + "/Qualifications/Delete",
  updateQualifications: url + "/Qualifications/Update",
};

export default API;

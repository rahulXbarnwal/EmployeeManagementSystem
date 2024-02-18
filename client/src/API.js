const url = "http://localhost:5136/api";

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
  getQualificationsOfAnEmployee: url + "/Qualifications/Employee",
};

export default API;

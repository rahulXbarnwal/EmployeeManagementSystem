const url = "http://localhost:5136/api";

const API = {
  getAllEmployees: url + "/Employee/All",
  getEmployee: url + "/Employee",
  updateEmployee: url + "/Employee",
  deleteEmployee: url + "/Employee",
  addEmployee: url + "/Employee",
};

export default API;

using System.ComponentModel.DataAnnotations;

namespace EmployeeWebAPI.DTOs
{
    public class EmployeeDTO
    {
        public int ID { get; set; } 
        public string Name { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        [Phone(ErrorMessage = "Invalid phone number")]
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        [Range(0, double.MaxValue, ErrorMessage = "Salary must be a non-negative value")]
        public decimal Salary { get; set; }
        public bool IsActive { get; set; } = true;
    }

}

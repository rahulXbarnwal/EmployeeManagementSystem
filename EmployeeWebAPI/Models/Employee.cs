using EmployeeWebAPI.Models;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Employee
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ID { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Invalid phone number")]
    public string Phone { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "Salary must be a non-negative value")]
    public decimal Salary { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation property for the User
    [JsonIgnore]
    public virtual User User { get; set; }

    [JsonIgnore]
    public virtual ICollection<Qualification> Qualifications { get; set; }

    public Employee()
    {
        // Initialize the collection in the constructor
        Qualifications = new HashSet<Qualification>();
    }
}

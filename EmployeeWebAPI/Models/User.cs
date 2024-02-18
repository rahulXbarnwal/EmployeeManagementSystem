using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class User
{
    [Key]
    [ForeignKey("Employee")] 
    public int UserId { get; set; }

    [Required]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    public string Email { get; set; }

    public string Password { get; set; } = string.Empty;

    public bool IsAdmin { get; set; } = false;

    // Navigation property to the Employee
    public virtual Employee Employee { get; set; }
}

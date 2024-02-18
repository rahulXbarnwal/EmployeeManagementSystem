using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EmployeeWebAPI.Models
{
    public class Qualification
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int QualificationId { get; set; }

        [Required]
        public string QualificationName { get; set; } = string.Empty;

        [Required]
        public string Institution { get; set; } = string.Empty;

        public string Stream { get; set; } = string.Empty;

        [Required]
        public int YearOfPassing { get; set; }

        [Range(0, 100, ErrorMessage = "Percentage must be between 0 and 100")]
        public decimal Percentage { get; set; }

        // Foreign key to Employee
        public int EmployeeId { get; set; }

        // Navigation property to Employee
        [ForeignKey("EmployeeId")]
        public virtual Employee Employee { get; set; }
    }
}

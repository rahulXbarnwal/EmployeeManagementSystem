using System.ComponentModel.DataAnnotations;

namespace EmployeeWebAPI.DTOs
{
    public class QualificationDTO
    {
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
    }
}

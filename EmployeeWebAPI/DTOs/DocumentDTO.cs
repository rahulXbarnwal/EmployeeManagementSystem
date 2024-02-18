using System.ComponentModel.DataAnnotations;

namespace EmployeeWebAPI.DTOs
{
    public class DocumentDTO
    {
        public int DocumentId { get; set; }

        [Required]
        public string DocumentName { get; set; }
        public string Remarks { get; set; }
        public string ContentType { get; set; }
        public int EmployeeId { get; set; }
    }

}

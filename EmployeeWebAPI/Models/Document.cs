using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class Document
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int DocumentId { get; set; }

    [Required]
    public string DocumentName { get; set; }

    public string Remarks { get; set; }

    public string ContentType { get; set; } // To store the MIME type of the file

    public byte[] Data { get; set; } // To store the binary data of the file

    // Foreign Key
    public int EmployeeId { get; set; }

    // Navigation property
    [ForeignKey("EmployeeId")]
    public virtual Employee Employee { get; set; }
}

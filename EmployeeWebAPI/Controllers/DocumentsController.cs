using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using EmployeeWebAPI.Data.Repository;
using EmployeeWebAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using EmployeeWebAPI.Models;
using Newtonsoft.Json;

namespace EmployeeWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentRepository _documentRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IMapper _mapper;

        public DocumentsController(IDocumentRepository documentRepository, IEmployeeRepository employeeRepository, IMapper mapper)
        {
            _documentRepository = documentRepository;
            _employeeRepository = employeeRepository;
            _mapper = mapper;
        }

        [HttpPost("Upload/{employeeId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadDocuments(int employeeId, [FromForm] List<IFormFile> files, [FromForm] string remarksJson)
        {
            if (files == null || !files.Any())
            {
                return BadRequest("Files must be provided.");
            }

            var remarks = JsonConvert.DeserializeObject<List<RemarkViewModel>>(remarksJson)?.Select(x => x.Remark).ToList();

            if (remarks == null || remarks.Count != files.Count)
            {
                return BadRequest("Each file must have a corresponding remark.");
            }

            var employeeExists = await _employeeRepository.GetByIdAsync(employeeId);
            if (employeeExists == null)
            {
                return NotFound($"Employee with ID {employeeId} not found.");
            }

            List<DocumentDTO> uploadedDocuments = new List<DocumentDTO>();

            for (int i = 0; i < files.Count; i++)
            {
                var file = files[i];
                var remark = remarks[i];
                byte[] fileData;
                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    fileData = memoryStream.ToArray();
                }

                var document = new Document
                {
                    DocumentName = file.FileName,
                    Remarks = remark,
                    ContentType = file.ContentType,
                    Data = fileData,
                    EmployeeId = employeeId
                };

                var addedDocument = await _documentRepository.AddDocumentAsync(document);
                var resultDto = _mapper.Map<DocumentDTO>(addedDocument);
                uploadedDocuments.Add(resultDto);
            }

            return Created("GetDocuments", uploadedDocuments);
        }


        [HttpGet("{documentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DocumentDTO>> GetDocument(int documentId)
        {
            var document = await _documentRepository.GetDocumentByIdAsync(documentId);
            if (document == null)
            {
                return NotFound();
            }

            var documentDto = _mapper.Map<DocumentDTO>(document);

            return Ok(documentDto);
        }

        [HttpGet("Employee/{employeeId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<DocumentDTO>>> GetAllDocumentsByEmployeeId(int employeeId)
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            var userId = userIdClaim != null ? Convert.ToInt32(userIdClaim.Value) : 0;

            var isAdminClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            var isAdmin = isAdminClaim != null && isAdminClaim.Value == "Admin";

            if (!isAdmin && employeeId != userId)
            {
                return Forbid();
            }

            var documents = await _documentRepository.GetAllDocumentsByEmployeeIdAsync(employeeId);
            var documentDtos = _mapper.Map<IEnumerable<DocumentDTO>>(documents);
            return Ok(documentDtos);
        }

        [HttpPut("{documentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EditDocument(int documentId, [FromBody] DocumentDTO documentDto)
        {
            var document = await _documentRepository.GetDocumentByIdAsync(documentId);
            if (document == null) return NotFound();

            _mapper.Map(documentDto, document);
            await _documentRepository.UpdateDocumentAsync(document);
            return Ok("Document Updated!");
        }

        [HttpDelete("{documentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDocument(int documentId)
        {
            await _documentRepository.DeleteDocumentAsync(documentId);
            return Ok("Document Deleted Successfully!");
        }

        [HttpGet("DownloadDocument/{documentId}")]
        [Authorize]
        public async Task<IActionResult> DownloadDocument(int documentId)
        {
            var document = await _documentRepository.GetDocumentByIdAsync(documentId);
            if (document == null)
            {
                return NotFound("Document not found.");
            }

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            var userId = userIdClaim != null ? Convert.ToInt32(userIdClaim.Value) : 0;

            var isAdminClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            var isAdmin = isAdminClaim != null && isAdminClaim.Value == "Admin";

            if (!isAdmin && document.EmployeeId != userId)
            {
                return Forbid();
            }

            Response.Headers.Add("Content-Disposition", $"attachment; filename=\"{document.DocumentName}\"");
            return File(document.Data, document.ContentType, document.DocumentName);
        }

        [HttpGet("View/{documentId}")]
        [Authorize]
        public async Task<IActionResult> ViewDocument(int documentId)
        {
            var document = await _documentRepository.GetDocumentByIdAsync(documentId);
            if (document == null)
            {
                return NotFound("Document not found.");
            }

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            var userId = userIdClaim != null ? Convert.ToInt32(userIdClaim.Value) : 0;

            var isAdminClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            var isAdmin = isAdminClaim != null && isAdminClaim.Value == "Admin";

            if (!isAdmin && document.EmployeeId != userId)
            {
                return Forbid();
            }

            Response.Headers.Add("Content-Disposition", $"inline; filename=\"{document.DocumentName}\"");
            return File(document.Data, document.ContentType, document.DocumentName);
        }
    }
}

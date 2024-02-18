using Microsoft.AspNetCore.Mvc;
using EmployeeWebAPI.Models;
using EmployeeWebAPI.Data.Repository;
using AutoMapper;
using EmployeeWebAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]

public class QualificationsController : ControllerBase
{
    private readonly IQualificationRepository _qualificationRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IMapper _mapper;

    public QualificationsController(IQualificationRepository qualificationRepository, IEmployeeRepository employeeRepository, IMapper mapper)
    {
        _qualificationRepository = qualificationRepository;
        _employeeRepository = employeeRepository;
        _mapper = mapper;
    }

    [HttpPost("Employee/{employeeId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddQualification(int employeeId, [FromBody] List<QualificationDTO> qualificationDtos)
    {
        try
        {
            if (qualificationDtos == null || !qualificationDtos.Any())
            {
                return BadRequest("Qualification data must be provided.");
            }

            var employee = await _employeeRepository.GetByIdAsync(employeeId);
            if (employee == null)
            {
                return NotFound("Invalid EmployeeID");
            }

            List<Qualification> addedQualifications = new List<Qualification>();

            foreach (var qualificationDto in qualificationDtos)
            {
                var qualification = _mapper.Map<Qualification>(qualificationDto);
                qualification.EmployeeId = employeeId;
                _qualificationRepository.Add(qualification);
                addedQualifications.Add(qualification);
            }

            await _qualificationRepository.SaveChangesAsync();

            return CreatedAtAction("GetQualificationsByEmployeeId", new { employeeId = employeeId }, qualificationDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while processing your request.");
        }
    }

    [HttpGet("Employee/{employeeId}")]
    [Authorize]
    public async Task<IActionResult> GetQualificationsByEmployeeId(int employeeId)
    {
        try
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            var userId = userIdClaim != null ? Convert.ToInt32(userIdClaim.Value) : 0;

            var isAdminClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            var isAdmin = isAdminClaim != null && isAdminClaim.Value == "Admin";

            if (!isAdmin && employeeId != userId)
            {
                return Forbid();
            }
            var employee = await _employeeRepository.GetByIdAsync(employeeId);
            if (employee == null)
            {
                return NotFound("Invalid EmployeeID");
            }

            var qualifications = await _qualificationRepository.GetQualificationsByEmployeeIdAsync(employeeId);
            if (!qualifications.Any())
            {
                return NotFound($"No qualifications found for employee ID {employeeId}.");
            }
            var result = qualifications.Select(q => new 
            {
                qualificationId = q.QualificationId,
                qualificationName = q.QualificationName,
                institution = q.Institution,
                stream = q.Stream,
                yearOfPassing = q.YearOfPassing,
                percentage = q.Percentage
            }).ToList();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while processing your request.");
        }
    }

    [HttpGet("{qualificationId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<QualificationDTO>> GetQualification(int qualificationId)
    {
        try
        {
            var qualification = await _qualificationRepository.GetQualificationByIdAsync(qualificationId);
            if (qualification == null)
            {
                return NotFound($"Qualification with ID {qualificationId} not found.");
            }

            var qualificationDto = _mapper.Map<QualificationDTO>(qualification);
            return Ok(qualificationDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while processing your request.");
        }
    }
}

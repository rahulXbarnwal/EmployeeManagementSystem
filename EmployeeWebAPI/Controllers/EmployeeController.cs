using AutoMapper;
using EmployeeWebAPI.Data;
using EmployeeWebAPI.Data.Repository;
using EmployeeWebAPI.DTOs;
using EmployeeWebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EmployeeWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IUserRepository _userRepository;
        private readonly EmployeeDBContext _dbContext;
        private readonly IMapper _mapper;

        public EmployeeController(IEmployeeRepository employeeRepository, IUserRepository userRepository, EmployeeDBContext dbContext, IMapper mapper)
        {
            _employeeRepository = employeeRepository;
            _userRepository = userRepository;
            _dbContext = dbContext;
            _mapper = mapper;
        }

        [HttpGet]
        [Route("All", Name = "GetAllEmployees")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<Employee>>> GetAllEmployees()
        {
            try
            {
                var employees = await _employeeRepository.GetAllAsync();
                var response = employees.Select(employee => new
                {
                    id = employee.ID,
                    name = employee.Name,
                    email = employee.Email,
                    department = employee.Department,
                    title = employee.Title,
                    phone = employee.Phone,
                    address = employee.Address,
                    salary = employee.Salary,
                    isActive = employee.IsActive
                }).ToList();
                return Ok(response);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error");
            }
        }

        [HttpGet("{id}", Name = "GetEmployeeById")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<Employee>> GetEmployeeById(int id)
        {
            try
            {
                var employee = await _employeeRepository.GetByIdAsync(id);

                if (employee == null)
                    return NotFound();

                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                var userId = userIdClaim != null ? Convert.ToInt32(userIdClaim.Value) : 0;

                var isAdminClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
                var isAdmin = isAdminClaim != null && isAdminClaim.Value == "Admin";

                if (!isAdmin && employee.ID != userId)
                {
                    return Forbid();
                }
                return Ok(employee);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error");
            }
        }

        [HttpGet("ByEmail/{email}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmployeeDTO>> GetEmployeeByEmail(string email)
        {
            try
            {
                var employee = await _employeeRepository.FindByEmailAsync(email);

                if (employee == null)
                {
                    return NotFound($"Employee with email {email} not found.");
                }

                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                var userId = userIdClaim != null ? Convert.ToInt32(userIdClaim.Value) : 0;

                var isAdminClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
                var isAdmin = isAdminClaim != null && isAdminClaim.Value == "Admin";

                if (!isAdmin && employee.ID != userId)
                {
                    return Forbid();
                }

                var employeeDto = _mapper.Map<EmployeeDTO>(employee);
                return Ok(employeeDto);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Internal Server Error: {ex.Message}");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateEmployee([FromBody] EmployeeDTO employeeDTO)
        {
            var newEmployee = _mapper.Map<Employee>(employeeDTO);

            using (var transaction = await _dbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    var userExists = await _userRepository.FindByEmailAsync(newEmployee.Email);
                    if (userExists != null)
                    {
                        return BadRequest("User already exists.");
                    }

                    var addedEmployee = await _employeeRepository.CreateAsync(newEmployee);

                    var user = new User
                    {
                        Email = newEmployee.Email,
                        Password = BCrypt.Net.BCrypt.HashPassword("12345"),
                        UserId = addedEmployee.ID,
                        IsAdmin = false
                    };

                    await _userRepository.RegisterAsync(user);
                    await transaction.CommitAsync();

                    return CreatedAtRoute("GetEmployeeById", new { id = addedEmployee.ID }, addedEmployee);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"An error occurred while creating the employee and user: {ex.Message}");
                }
            }
        }


        [HttpPatch("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmployeeDTO>> UpdateEmployee(int id, [FromBody] JsonPatchDocument<EmployeeDTO> patchDocument)
        {
            if (patchDocument == null)
                return BadRequest("Patch document is missing.");

            try
            {
                var existingEmployee = await _employeeRepository.GetByIdAsync(id);
                if (existingEmployee == null)
                {
                    return NotFound($"Employee with ID {id} not found.");
                }

                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                var userId = userIdClaim != null ? Convert.ToInt32(userIdClaim.Value) : 0;

                var isAdminClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
                var isAdmin = isAdminClaim != null && isAdminClaim.Value == "Admin";

                if (!isAdmin && existingEmployee.ID != userId)
                {
                    return Forbid();
                }

                var employeeDto = _mapper.Map<EmployeeDTO>(existingEmployee);
                patchDocument.ApplyTo(employeeDto, ModelState);

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                _mapper.Map(employeeDto, existingEmployee);

                using (var transaction = await _dbContext.Database.BeginTransactionAsync())
                {
                    try
                    {
                        var result = await _employeeRepository.UpdateAsync(existingEmployee);

                        var user = await _userRepository.FindByIdAsync(id);
                        if (user != null)
                        {
                            user.Email = existingEmployee.Email;
                            await _userRepository.UpdateAsync(user);
                        }

                        await transaction.CommitAsync();

                        if (result > 0)
                        {
                            var updatedDto = _mapper.Map<EmployeeDTO>(existingEmployee);
                            return Ok(updatedDto);
                        }
                        else
                        {
                            return StatusCode(StatusCodes.Status500InternalServerError, "Failed to update employee");
                        }
                    }
                    catch (Exception)
                    {
                        await transaction.RollbackAsync();
                        return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error");
                    }
                }
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Employee with ID {id} not found.");
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteEmployee(int id)
        {
            try
            {
                using (var transaction = await _dbContext.Database.BeginTransactionAsync())
                {
                    try
                    {
                        var user = await _userRepository.FindByIdAsync(id);
                        if (user != null)
                        {
                            var userDeleted = await _userRepository.DeleteAsync(user.UserId);
                            if (!userDeleted)
                            {
                                await transaction.RollbackAsync();
                                return StatusCode(StatusCodes.Status500InternalServerError, "Failed to delete user associated with the employee");
                            }
                        }

                        var employeeDeleted = await _employeeRepository.DeleteAsync(id);
                        if (!employeeDeleted)
                        {
                            await transaction.RollbackAsync();
                            return NotFound($"Employee with ID {id} not found.");
                        }

                        await transaction.CommitAsync();
                        return NoContent();
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        return StatusCode(StatusCodes.Status500InternalServerError, $"Internal Server Error: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Internal Server Error: {ex.Message}");
            }
        }

    }
}

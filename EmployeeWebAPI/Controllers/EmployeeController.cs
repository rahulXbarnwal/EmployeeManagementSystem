using AutoMapper;
using EmployeeWebAPI.Data;
using EmployeeWebAPI.Data.Repository;
using EmployeeWebAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IMapper _mapper;

        public EmployeeController(IEmployeeRepository employeeRepository, IMapper mapper)
        {
            _employeeRepository = employeeRepository;
            _mapper = mapper;
        }

        [HttpGet]
        [Route("All", Name = "GetAllEmployees")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<EmployeeDTO>>> GetAllEmployees()
        {
            try
            {
                var employees = await _employeeRepository.GetAllAsync();
                var employeeDTOs = _mapper.Map<List<EmployeeDTO>>(employees);
                return Ok(employeeDTOs);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error");
            }
        }

        [HttpGet("{id}", Name = "GetEmployeeById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmployeeDTO>> GetEmployeeById(int id)
        {
            try
            {
                var employee = await _employeeRepository.GetByIdAsync(id);

                if (employee == null)
                    return NotFound();

                var employeeDTO = _mapper.Map<EmployeeDTO>(employee);
                return Ok(employeeDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error");
            }
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmployeeDTO>> CreateEmployee([FromBody] EmployeeDTO employeeDTO)
        {
            try
            {
                if (employeeDTO == null)
                    return BadRequest("Invalid data");

                var employee = _mapper.Map<Employee>(employeeDTO);
                var result = await _employeeRepository.CreateAsync(employee);

                if (result > 0)
                {
                    var createdEmployeeDTO = _mapper.Map<EmployeeDTO>(employee);
                    return CreatedAtRoute("GetEmployeeById", new { id = createdEmployeeDTO.ID }, createdEmployeeDTO);
                }

                return StatusCode(StatusCodes.Status500InternalServerError, "Failed to create employee");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error");
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EmployeeDTO>> UpdateEmployee(int id, [FromBody] EmployeeDTO employeeDTO)
        {
            if (employeeDTO == null || id != employeeDTO.ID)
                return BadRequest("Invalid data");

            var existingEmployee = await _employeeRepository.GetByIdAsync(id);
            if (existingEmployee == null) return NotFound();

            _mapper.Map(employeeDTO, existingEmployee);

            var result = await _employeeRepository.UpdateAsync(existingEmployee);

            if (result > 0)
            {
                var updatedEmployee = await _employeeRepository.GetByIdAsync(id);
                if (updatedEmployee != null)
                {
                    var updatedEmployeeDTO = _mapper.Map<EmployeeDTO>(updatedEmployee);
                    return Ok(updatedEmployeeDTO);
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, "Failed to fetch updated employee data");
                }
            }
            else
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Failed to update employee");
            }
        }


        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteEmployee(int id)
        {
            try
            {
                var result = await _employeeRepository.DeleteAsync(id);

                if (result)
                    return NoContent();

                return NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error");
            }
        }
    }
}

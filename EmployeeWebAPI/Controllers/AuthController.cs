using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using EmployeeWebAPI.Models;
using EmployeeWebAPI.Data.Repository;
using EmployeeWebAPI.DTOs;
using EmployeeWebAPI.Data;

namespace EmployeeWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly JwtSettings _jwtSettings;
        private readonly IUserRepository _userRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IMapper _mapper;
        private readonly EmployeeDBContext _dbContext;

        public AuthController(IOptions<JwtSettings> jwtSettings, IUserRepository userRepository, IEmployeeRepository employeeRepository, IMapper mapper, EmployeeDBContext dbContext)
        {
            _jwtSettings = jwtSettings.Value;
            _userRepository = userRepository;
            _employeeRepository = employeeRepository;
            _mapper = mapper;
            _dbContext = dbContext;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] UserDTO registrationData)
        {
            using (var transaction = await _dbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    if (await _userRepository.FindByEmailAsync(registrationData.Email) != null)
                    {
                        return BadRequest("User already exists.");
                    }

                    var employeeDto = new EmployeeDTO { Email = registrationData.Email };
                    var employee = _mapper.Map<Employee>(employeeDto);
                    var createdEmployee = await _employeeRepository.CreateAsync(employee);

                    var user = _mapper.Map<User>(registrationData);
                    user.Password = BCrypt.Net.BCrypt.HashPassword(registrationData.Password);
                    user.UserId = employee.ID;
                    await _userRepository.RegisterAsync(user);

                    await transaction.CommitAsync();

                    return StatusCode(StatusCodes.Status201Created, "User Registered Successfully!");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"An error occurred while registering the user: {ex.Message}");
                }
            }
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserDTO loginCredentials)
        {
            try
            {
                var user = await ValidateUserCredentials(loginCredentials.Email, loginCredentials.Password);
                if (user == null) return NotFound("User not found or password is incorrect.");

                var token = GenerateJwtToken(user);
                var employee = await _employeeRepository.GetByIdAsync(user.UserId);
                var employeeDto = _mapper.Map<EmployeeDTO>(employee);

                var response = new
                {
                    Employee = employeeDto,
                    isAdmin = user.IsAdmin,
                    Token = token
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred: {ex.Message}");
            }
        }

        private async Task<User> ValidateUserCredentials(string email, string password)
        {
            var user = await _userRepository.FindByEmailAsync(email);
            if (user != null && BCrypt.Net.BCrypt.Verify(password, user.Password))
            {
                return user;
            }

            return null;
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.SecretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User"),
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}

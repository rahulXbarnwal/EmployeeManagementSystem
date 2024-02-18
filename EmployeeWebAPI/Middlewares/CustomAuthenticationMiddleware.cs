using EmployeeWebAPI.Data.Repository;
using System.Security.Claims;

namespace EmployeeWebAPI.Middlewares
{
    public class CustomAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;

        public CustomAuthenticationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IUserRepository userRepository)
        {
            if (context.User.Identity?.IsAuthenticated ?? false)
            {
                var userIdClaim = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                {
                    var user = await userRepository.FindByIdAsync(userId);
                    if (user != null)
                    {
                        var claims = new[]
                        {
                            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                            new Claim(ClaimTypes.Email, user.Email),
                            new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
                        };
                        var identity = new ClaimsIdentity(claims, "jwt");
                        context.User.AddIdentity(identity);
                    }
                }
            }

            await _next(context);
        }
    }
}

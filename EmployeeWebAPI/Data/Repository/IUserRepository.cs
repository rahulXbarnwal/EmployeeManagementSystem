using EmployeeWebAPI.Models;

namespace EmployeeWebAPI.Data.Repository
{
    public interface IUserRepository
    {
        Task<bool> RegisterAsync(User user);
        Task<User> FindByIdAsync(int id);
        Task<User> FindByEmailAsync(string email);
        Task<int> UpdateAsync(User user);
        Task<bool> DeleteAsync(int userId);
    }
}
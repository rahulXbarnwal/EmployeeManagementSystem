using EmployeeWebAPI.Models;
using EmployeeWebAPI.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace EmployeeWebAPI.Data.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly EmployeeDBContext _context;

        public UserRepository(EmployeeDBContext context)
        {
            _context = context;
        }

        public async Task<bool> RegisterAsync(User user)
        {
            var existingUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == user.Email);

            if (existingUser != null)
            {
                return false;
            }

            await _context.Users.AddAsync(user);
            var created = await _context.SaveChangesAsync();
            return created > 0;
        }

        public async Task<User> FindByIdAsync(int id)
        {
            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User> FindByEmailAsync(string email)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);
            return user;
        }

        public async Task<int> UpdateAsync(User user)
        {
            _context.Users.Update(user);
            return await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int userId)
        {
            var userToDelete = await _context.Users.FindAsync(userId);
            if (userToDelete == null)
                return false; 

            _context.Users.Remove(userToDelete);
            await _context.SaveChangesAsync();
            return true; 
        }
    }
}

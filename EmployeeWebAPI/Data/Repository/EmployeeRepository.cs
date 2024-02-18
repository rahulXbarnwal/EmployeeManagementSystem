using EmployeeWebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeWebAPI.Data.Repository
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly EmployeeDBContext _dbContext;

        public EmployeeRepository(EmployeeDBContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task<List<Employee>> GetAllAsync()
        {
            return await _dbContext.Employees.ToListAsync();
        }

        public async Task<Employee> GetByIdAsync(int id)
        {
            return await _dbContext.Employees.FindAsync(id);
        }

        public async Task<Employee> FindByEmailAsync(string email)
        {
            return await _dbContext.Employees.FirstOrDefaultAsync(e => e.Email == email);
        }

        public async Task<Employee> CreateAsync(Employee employee)
        {
            await _dbContext.Employees.AddAsync(employee);
            await _dbContext.SaveChangesAsync();
            return employee;
        }

        public async Task<int> UpdateAsync(Employee employee)
        {
            var existingEmployee = await _dbContext.Employees.FindAsync(employee.ID);
            if (existingEmployee == null)
            {
                throw new KeyNotFoundException("Employee not found.");
            }
            _dbContext.Entry(existingEmployee).CurrentValues.SetValues(employee);
            return await _dbContext.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var employee = await _dbContext.Employees.FindAsync(id);

            if (employee == null)
                return false;

            _dbContext.Employees.Remove(employee);
            await _dbContext.SaveChangesAsync();

            return true;
        }
    }
}

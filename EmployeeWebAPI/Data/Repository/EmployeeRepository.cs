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

        public async Task<int> CreateAsync(Employee employee)
        {
            _dbContext.Employees.Add(employee);
            return await _dbContext.SaveChangesAsync();
        }

        public async Task<int> UpdateAsync(Employee employee)
        {
            _dbContext.Entry(employee).State = EntityState.Modified;
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

namespace EmployeeWebAPI.Data.Repository
{
    public interface IEmployeeRepository
    {
        Task<List<Employee>> GetAllAsync();
        Task<Employee> GetByIdAsync(int id);
        Task<int> CreateAsync(Employee employee);
        Task<int> UpdateAsync(Employee employee);
        Task<bool> DeleteAsync(int id);
    }
}

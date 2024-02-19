using EmployeeWebAPI.Models;

namespace EmployeeWebAPI.Data.Repository
{
    public interface IQualificationRepository
    {
        void Add(Qualification qualification);
        Task UpdateAsync(Qualification qualification);
        Task DeleteQualificationsAsync(IEnumerable<int> qualificationIds);
        Task SaveChangesAsync();
        Task<Qualification> AddQualificationAsync(Qualification qualification);
        Task<IEnumerable<Qualification>> GetQualificationsByEmployeeIdAsync(int employeeId);
        Task<Qualification> GetQualificationByIdAsync(int id);
    }
}

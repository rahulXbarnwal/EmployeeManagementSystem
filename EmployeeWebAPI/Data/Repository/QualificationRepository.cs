using EmployeeWebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeWebAPI.Data.Repository
{
    public class QualificationRepository : IQualificationRepository
    {
        private readonly EmployeeDBContext _context;

        public QualificationRepository(EmployeeDBContext context)
        {
            _context = context;
        }

        public void Add(Qualification qualification)
        {
            _context.Qualifications.Add(qualification);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
        public async Task<Qualification> AddQualificationAsync(Qualification qualification)
        {
            await _context.Qualifications.AddAsync(qualification);
            await _context.SaveChangesAsync();
            return qualification;
        }

        public async Task<IEnumerable<Qualification>> GetQualificationsByEmployeeIdAsync(int employeeId)
        {
            return await _context.Qualifications
                .Where(q => q.EmployeeId == employeeId)
                .ToListAsync();
        }

        public async Task<Qualification> GetQualificationByIdAsync(int qualificationId)
        {
            return await _context.Qualifications
                .Where(q => q.QualificationId == qualificationId).FirstOrDefaultAsync();
        }
    }
}

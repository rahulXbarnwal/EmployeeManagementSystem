using EmployeeWebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeWebAPI.Data
{
    public class EmployeeDBContext : DbContext
    {
        public EmployeeDBContext(DbContextOptions<EmployeeDBContext> options): base(options)
        {
        }
        public DbSet <Employee> Employees { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Qualification> Qualifications { get; set; }
        public DbSet<Document> Documents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.User)
                .WithOne(a => a.Employee)
                .HasForeignKey<User>(a => a.UserId)
                .IsRequired(false);
        }
    }
}

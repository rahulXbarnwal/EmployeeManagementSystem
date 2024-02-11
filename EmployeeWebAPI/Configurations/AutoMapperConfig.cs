using AutoMapper;
using EmployeeWebAPI.Data;
using EmployeeWebAPI.Models;

namespace EmployeeWebAPI.Configurations
{
    public class AutoMapperConfig : Profile
    {
        public AutoMapperConfig() 
        { 
            CreateMap<EmployeeDTO, Employee>().ReverseMap()
                .ForMember(n => n.Address, opt => opt.MapFrom(n => string.IsNullOrEmpty(n.Address) ? "No address found": n.Address))
                .AddTransform<string>(n => string.IsNullOrEmpty(n) ? "No data found": n);
        }
    }
}

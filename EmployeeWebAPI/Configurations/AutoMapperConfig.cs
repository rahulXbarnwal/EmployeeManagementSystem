using AutoMapper;
using EmployeeWebAPI.DTOs;
using EmployeeWebAPI.Models;

public class AutoMapperConfig : Profile
{
    public AutoMapperConfig()
    {
        CreateMap<User, UserDTO>()
            .ReverseMap()
            .ForMember(dest => dest.Password, opt => opt.Ignore());

        CreateMap<Employee, EmployeeDTO>()
            .ReverseMap();

        CreateMap<Qualification, QualificationDTO>()
            .ReverseMap();

        CreateMap<Document, DocumentDTO>()
            .ReverseMap();
    }
}

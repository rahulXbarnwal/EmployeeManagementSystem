using EmployeeWebAPI.Configurations;
using EmployeeWebAPI.Data;
using EmployeeWebAPI.Data.Repository;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<EmployeeDBContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("EmployeeAppDBConnection"));
});

builder.Services.AddAutoMapper(typeof(AutoMapperConfig));

builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();

builder.Services.AddCors(options => options.AddPolicy("MyTestCORS", policy =>
{
    //Allow all origins
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
}));

builder.Services.AddControllers(
    //options => options.ReturnHttpNotAcceptable = true
    ).AddNewtonsoftJson().AddXmlDataContractSerializerFormatters();


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("MyTestCORS");

app.UseAuthorization();

app.MapControllers();

app.Run();

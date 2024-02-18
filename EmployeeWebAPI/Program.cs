using EmployeeWebAPI.Data;
using EmployeeWebAPI.Data.Repository;
using EmployeeWebAPI.Middlewares;
using EmployeeWebAPI.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Configure JWT Settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// Configure Entity Framework Core with Npgsql
builder.Services.AddDbContext<EmployeeDBContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("EmployeeAppDBConnection")));

// Configure Authentication with JWT Bearer
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// Register Repository as a scoped dependency
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IQualificationRepository, QualificationRepository>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();

// Configure AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Configure CORS to allow any origin, header, and method
builder.Services.AddCors(options => options.AddPolicy("MyTestCORS", policy =>
{
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
}));

// Add controllers and configure JSON and XML formatters
builder.Services.AddControllers()
    .AddNewtonsoftJson()
    .AddXmlDataContractSerializerFormatters();

// Configure Swagger/OpenAPI
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

// Use CORS policy
app.UseCors("MyTestCORS");

// Use Authentication & Authorization
app.UseAuthentication(); // Ensure to call UseAuthentication before UseAuthorization
app.UseAuthorization();

app.UseMiddleware<CustomAuthenticationMiddleware>();

app.MapControllers();

app.Run();

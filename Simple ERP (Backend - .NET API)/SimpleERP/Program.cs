using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SimpleERP.Data;
using Microsoft.AspNetCore.Identity;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSignalR();

// Add HttpContextAccessor (used by Audit interceptor)
builder.Services.AddHttpContextAccessor();

// Register AuditSaveChangesInterceptor
builder.Services.AddScoped<AuditSaveChangesInterceptor>();

// Add Identity
builder.Services.AddIdentity<SimpleERP.Models.ApplicationUser, Microsoft.AspNetCore.Identity.IdentityRole<int>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Ensure Identity doesn't redirect to /Account/Login in Web API
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return System.Threading.Tasks.Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return System.Threading.Tasks.Task.CompletedTask;
    };
});

// Configure CORS
builder.Services.AddCors(options =>
{
    // Policy name changed to "AllowAngular" so it matches usage below
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .WithOrigins("http://localhost:4200")
              .AllowCredentials(); // Required for SignalR
    });
});

// Configure DbContext with interceptor
builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
           .AddInterceptors(sp.GetRequiredService<AuditSaveChangesInterceptor>()));

// Register domain services
builder.Services.AddScoped<SimpleERP.Services.OrderService>();

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Simple ERP API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Apply any pending migrations at startup so DB schema matches model
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

// Seed roles and admin user
await SimpleERP.DbInitializer.SeedAsync(app.Services);

// Configure the HTTP request pipeline.
// Concurrency middleware should catch concurrency exceptions and return 409
app.UseMiddleware<SimpleERP.Middleware.ConcurrencyExceptionMiddleware>();
app.UseMiddleware<SimpleERP.Middleware.ExceptionMiddleware>();

// Enable Swagger and Swagger UI for all environments temporarily so UI is available
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Simple ERP API v1");
    // Serve the UI at /swagger
    c.RoutePrefix = "swagger";
});

// Commented out to avoid "Failed to determine the https port" warning while testing over HTTP
// app.UseHttpsRedirection();

// CORS must be applied before authentication/authorization
app.UseCors("AllowAngular");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<SimpleERP.Hubs.OrderHub>("/hubs/orders");

app.Run();

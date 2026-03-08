using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SimpleERP.Data;
using SimpleERP.DTOs;
using SimpleERP.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SimpleERP.Controllers
{
    public class AuthController : BaseApiController
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;

        public AuthController(
            ApplicationDbContext context,
            IConfiguration configuration,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole<int>> roleManager)
        {
            _context = context;
            _configuration = configuration;
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDto>> Register(UserRegisterDto request)
        {
            if (await _userManager.FindByEmailAsync(request.Email) != null)
                return BadRequest("User already exists.");

            var user = new ApplicationUser
            {
                UserName = request.Username,
                Email = request.Email,
                FullName = request.FullName ?? string.Empty,
                EmailConfirmed = true
            };

            // All steps must be atomic: create user, assign role, log activity
            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var createResult = await _userManager.CreateAsync(user, request.Password);
                if (!createResult.Succeeded)
                {
                    await tx.RollbackAsync();
                    return BadRequest(new { message = "Registration failed", errors = createResult.Errors.Select(e => e.Description) });
                }

                // Always assign 'Employee' role for registrations initiated by clients
                var defaultRole = "Employee";
                if (!await _roleManager.RoleExistsAsync(defaultRole))
                {
                    await _roleManager.CreateAsync(new IdentityRole<int> { Name = defaultRole, NormalizedName = defaultRole.ToUpperInvariant() });
                }

                await _userManager.AddToRoleAsync(user, defaultRole);

                // Log registration
                _context.ActivityLogs.Add(new ActivityLog { Action = "User Registered", EntityName = "User", UserId = user.Id });
                await _context.SaveChangesAsync();

                await tx.CommitAsync();

                var roles = await _userManager.GetRolesAsync(user);
                return Ok(new UserResponseDto
                {
                    Id = user.Id,
                    Username = user.UserName,
                    Email = user.Email,
                    Role = roles.FirstOrDefault() ?? "Employee",
                    Token = CreateToken(user, roles)
                });
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserResponseDto>> Login(UserLoginDto request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                Console.WriteLine($"Login failed: User with email {request.Email} not found");
                return BadRequest("Wrong credentials.");
            }
            
            var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordValid)
            {
                Console.WriteLine($"Login failed: Invalid password for user {request.Email}");
                return BadRequest("Wrong credentials.");
            }

            // Reject deactivated accounts
            if (user is ApplicationUser appUser && !appUser.IsActive)
            {
                return Forbid("Account is deactivated.");
            }

            // Log login
            _context.ActivityLogs.Add(new ActivityLog { Action = "User Logged In", EntityName = "User", UserId = user.Id });
            await _context.SaveChangesAsync();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new UserResponseDto
            {
                Id = user.Id,
                Username = user.UserName ?? string.Empty,
                Email = user.Email,
                Role = roles.FirstOrDefault() ?? "Employee",
                Token = CreateToken(user, roles)
            });
        }

        private string CreateToken(ApplicationUser user, IList<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("Jwt:Key").Value!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var token = new JwtSecurityToken(
                issuer: _configuration.GetSection("Jwt:Issuer").Value,
                audience: _configuration.GetSection("Jwt:Audience").Value,
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

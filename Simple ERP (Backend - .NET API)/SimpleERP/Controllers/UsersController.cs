using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleERP.Data;
using SimpleERP.DTOs;
using SimpleERP.Models;

namespace SimpleERP.Controllers
{
    [Authorize(Roles = "Admin")]
    public class UsersController : BaseApiController
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly ApplicationDbContext _db;

        public UsersController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<int>> roleManager, ApplicationDbContext db)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserManagementDto>>> GetUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userList = new List<UserManagementDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new UserManagementDto
                {
                    Id = user.Id,
                    Username = user.UserName ?? string.Empty,
                    FullName = user.FullName,
                    Email = user.Email ?? string.Empty,
                    Role = roles.FirstOrDefault() ?? "Employee",
                    IsActive = user.IsActive,
                    DeactivatedAt = user.DeactivatedAt
                });
            }

            return Ok(userList);
        }

        [HttpPost("update-role/{id}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] RoleUpdateDto request)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound();

            if (!await _roleManager.RoleExistsAsync(request.SelectedRole))
                return BadRequest("Role does not exist.");

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, request.SelectedRole);

            _db.ActivityLogs.Add(new ActivityLog { Action = $"Role changed to {request.SelectedRole}", EntityName = "User", UserId = GetUserId() });
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("toggle-status/{id}")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            user.IsActive = !user.IsActive;
            user.DeactivatedAt = user.IsActive ? null : DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);

            var action = user.IsActive ? "User Activated" : "User Deactivated";
            _db.ActivityLogs.Add(new ActivityLog { Action = action, EntityName = "User", UserId = GetUserId() });
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}

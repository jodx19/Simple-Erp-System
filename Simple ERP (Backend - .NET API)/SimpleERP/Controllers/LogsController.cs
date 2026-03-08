using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleERP.Data;
using SimpleERP.Models;

namespace SimpleERP.Controllers
{
    [Authorize]
    public class LogsController : BaseApiController
    {
        private readonly ApplicationDbContext _context;

        public LogsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ActivityLog>>> GetLogs()
        {
            var user = HttpContext.User;
            if (user.IsInRole("Admin"))
            {
                return await _context.ActivityLogs
                    .OrderByDescending(l => l.Timestamp)
                    .Take(100)
                    .ToListAsync();
            }

            if (user.IsInRole("Manager"))
            {
                // Filter out admin management actions - naive filter based on EntityName/UserId of admin (id=1) or Action containing 'Admin'
                return await _context.ActivityLogs
                    .Where(l => l.UserId != 1) // avoid showing actions performed by admin
                    .Where(l => !l.Action.Contains("Admin", StringComparison.InvariantCultureIgnoreCase))
                    .OrderByDescending(l => l.Timestamp)
                    .Take(100)
                    .ToListAsync();
            }

            // Other users should not see logs
            return Forbid();
        }
    }
}

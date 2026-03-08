using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleERP.Data;
using SimpleERP.Models;

namespace SimpleERP.Controllers
{
    [Authorize(Roles = "Admin")]
    public class SettingsController : BaseApiController
    {
        private readonly ApplicationDbContext _context;

        public SettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<CompanySettings>> GetSettings()
        {
            var settings = await _context.CompanySettings.FirstOrDefaultAsync();
            if (settings == null) return NotFound();
            return settings;
        }

        [HttpPut]
        public async Task<IActionResult> UpdateSettings(CompanySettings request)
        {
            var settings = await _context.CompanySettings.FirstOrDefaultAsync();
            if (settings == null) return NotFound();

            settings.CompanyName = request.CompanyName;
            settings.Address = request.Address;
            settings.LogoUrl = request.LogoUrl;
            settings.Currency = request.Currency;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

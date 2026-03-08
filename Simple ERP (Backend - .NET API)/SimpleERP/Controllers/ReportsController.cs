using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleERP.Data;
using SimpleERP.DTOs;

namespace SimpleERP.Controllers
{
    [Authorize(Roles = "Admin,Manager")]
    public class ReportsController : BaseApiController
    {
        private readonly ApplicationDbContext _db;

        public ReportsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpPost("sales")]
        public async Task<ActionResult<IEnumerable<SalesReportDto>>> SalesReport([FromBody] SalesReportRequestDto request)
        {
            var from = request.From.Date;
            var to = request.To.Date.AddDays(1).AddTicks(-1);

            var report = await _db.Orders
                .Where(o => o.OrderDate >= from && o.OrderDate <= to)
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new SalesReportDto
                {
                    Date = g.Key,
                    TotalAmount = g.Sum(x => x.TotalAmount),
                    OrdersCount = g.Count()
                })
                .OrderBy(r => r.Date)
                .ToListAsync();

            return Ok(report);
        }
    }
}

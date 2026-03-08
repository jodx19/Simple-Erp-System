using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleERP.Data;
using SimpleERP.DTOs;

namespace SimpleERP.Controllers
{
    [Authorize]
    public class DashboardController : BaseApiController
    {
        private readonly ApplicationDbContext _db;

        public DashboardController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<DashboardStatsDto>> GetStats()
        {
            var totalProducts = await _db.Products.CountAsync(p => p.IsActive);
            var totalStockValue = await _db.Products.SumAsync(p => p.Price * p.StockQuantity);
            var outOfStock = await _db.Products.CountAsync(p => p.StockQuantity <= p.LowStockThreshold);

            var today = DateTime.UtcNow.Date;
            var todaySales = await _db.Orders
                .Where(o => o.OrderDate >= today)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

            var recentOrders = await _db.Orders
                .CountAsync(o => o.OrderDate >= DateTime.UtcNow.AddDays(-7));

            var stats = new DashboardStatsDto
            {
                TotalProducts = totalProducts,
                TotalStockValue = totalStockValue,
                OutOfStockCount = outOfStock,
                TodaySales = todaySales,
                RecentOrdersCount = recentOrders
            };

            // Calculate weekly trends
            var lastWeek = DateTime.UtcNow.Date.AddDays(-6);
            var trends = await _db.Orders
                .Where(o => o.OrderDate >= lastWeek)
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new DailySaleDto
                {
                    Date = g.Key,
                    Amount = g.Sum(x => x.TotalAmount)
                })
                .OrderBy(t => t.Date)
                .ToListAsync();

            stats.SalesTrends = trends;

            return Ok(stats);
        }
    }
}

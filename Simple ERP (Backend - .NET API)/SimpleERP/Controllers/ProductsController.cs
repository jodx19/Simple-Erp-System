using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleERP.Data;
using SimpleERP.DTOs;
using SimpleERP.Models;

namespace SimpleERP.Controllers
{
    [Authorize]
    public class ProductsController : BaseApiController
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetStats()
        {
            // Mock data as requested
            var stats = new DashboardStatsDto
            {
                TotalProducts = 50,
                TotalStockValue = 12500.50m,
                OutOfStockCount = 5
            };
            return Ok(stats);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.Where(p => p.IsActive).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || !product.IsActive) return NotFound();
            return product;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<Product>> CreateProduct(ProductCreateDto request)
        {
            var product = new Product
            {
                Name = request.Name,
                Price = request.Price,
                StockQuantity = request.StockQuantity
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            _context.ActivityLogs.Add(new ActivityLog 
            { 
                Action = "Created Product", 
                EntityName = product.Name, 
                UserId = GetUserId() 
            });
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateProduct(int id, ProductCreateDto request)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.Name = request.Name;
            product.Price = request.Price;
            product.StockQuantity = request.StockQuantity;

            _context.ActivityLogs.Add(new ActivityLog 
            { 
                Action = "Updated Product", 
                EntityName = product.Name, 
                UserId = GetUserId() 
            });
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            // Soft delete for professional app
            product.IsActive = false;

            _context.ActivityLogs.Add(new ActivityLog 
            { 
                Action = "Deleted Product (Soft)", 
                EntityName = product.Name, 
                UserId = GetUserId() 
            });
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

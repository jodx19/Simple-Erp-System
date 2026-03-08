using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleERP.Data;
using SimpleERP.Models;
using SimpleERP.Services;

namespace SimpleERP.Controllers
{
    [Authorize]
    public class OrdersController : BaseApiController
    {
        private readonly OrderService _orderService;
        private readonly ApplicationDbContext _db;

        public OrdersController(OrderService orderService, ApplicationDbContext db)
        {
            _orderService = orderService;
            _db = db;
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] DTOs.OrderCreateDto request)
        {
            try
            {
                var userId = GetUserId();
                if (userId == null) return Unauthorized();
                var order = new Order
                {
                    CustomerName = request.CustomerName,
                    CustomerId = request.CustomerId,
                    PaymentMethod = request.PaymentMethod,
                    Notes = request.Notes,
                    OrderDate = DateTime.UtcNow,
                    Status = OrderStatus.Pending,
                    UserId = userId
                };

                var items = request.Items.Select(i => new OrderItem
                {
                    ProductId = i.ProductId,
                    Quantity = i.Quantity
                }).ToList();

                var created = await _orderService.CreateOrderAsync(order, items);
                return CreatedAtAction(nameof(GetOrder), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict("The product stock was modified by another transaction. Please retry the operation.");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            var user = HttpContext.User;
            if (user.IsInRole("Admin") || user.IsInRole("Manager"))
            {
                return await _db.Orders
                    .Include(o => o.Items)
                    .OrderByDescending(o => o.OrderDate)
                    .Take(200)
                    .ToListAsync();
            }

            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            return await _db.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.Items)
                .OrderByDescending(o => o.OrderDate)
                .Take(200)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();

            var user = HttpContext.User;
            if (user.IsInRole("Admin") || user.IsInRole("Manager")) return order;

            var userId = GetUserId();
            if (userId == null || order.UserId != userId) return Forbid();

            return order;
        }
    }
}

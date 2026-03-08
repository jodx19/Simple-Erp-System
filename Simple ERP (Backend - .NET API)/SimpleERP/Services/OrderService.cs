using Microsoft.EntityFrameworkCore;
using SimpleERP.Data;
using Microsoft.AspNetCore.SignalR;
using SimpleERP.Hubs;
using SimpleERP.Models;

namespace SimpleERP.Services
{
    public class OrderService
    {
        private readonly ApplicationDbContext _db;
        private readonly IHubContext<OrderHub> _hubContext;

        public OrderService(ApplicationDbContext db, IHubContext<OrderHub> hubContext)
        {
            _db = db;
            _hubContext = hubContext;
        }

        public async Task<Order> CreateOrderAsync(Order order, IEnumerable<OrderItem> items)
        {
            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                // Ensure UnitPrice is snapshotted from product price and validate stock
                var itemList = new List<OrderItem>();
                decimal total = 0m;
                foreach (var item in items)
                {
                    var product = await _db.Products.Where(p => p.Id == item.ProductId).SingleAsync();

                    if (product.StockQuantity < item.Quantity)
                        throw new InvalidOperationException($"Insufficient stock for {product.Name}");

                    // snapshot price
                    item.UnitPrice = product.Price;
                    total += item.UnitPrice * item.Quantity;

                    product.StockQuantity -= item.Quantity;
                    itemList.Add(item);
                }

                order.TotalAmount = total;
                order.Items = itemList;
                _db.Orders.Add(order);
                await _db.SaveChangesAsync(); // Save first to get the Order ID

                // Now add stock adjustments with the real Order ID
                foreach (var item in itemList)
                {
                    _db.StockAdjustments.Add(new StockAdjustment
                    {
                        ProductId = item.ProductId,
                        QuantityChanged = -item.Quantity,
                        AdjustmentType = StockAdjustmentType.Sale,
                        Reason = $"Order {order.Id}",
                        UserId = order.UserId // Record who made the sale
                    });
                }

                await _db.SaveChangesAsync(); // Final save for adjustments
                await tx.CommitAsync();

                // Notify all clients about the new order
                await _hubContext.Clients.All.SendAsync("NewOrderReceived", order);

                return order;
            }
            catch (DbUpdateConcurrencyException)
            {
                await tx.RollbackAsync();
                throw; // Let controller handle and return 409
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }
    }
}

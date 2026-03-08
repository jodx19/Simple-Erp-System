using System;
using System.Collections.Generic;

namespace SimpleERP.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty; // Keep for guest/simple orders
        public int? CustomerId { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
        public string? Notes { get; set; }
        public int? UserId { get; set; }

        // Navigation
        public Customer? Customer { get; set; }
        public ApplicationUser? User { get; set; }
        public ICollection<OrderItem>? Items { get; set; }
    }
}

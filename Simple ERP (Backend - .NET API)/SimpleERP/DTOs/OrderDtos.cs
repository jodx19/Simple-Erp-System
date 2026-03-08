using System.Collections.Generic;

namespace SimpleERP.DTOs
{
    public class OrderItemCreateDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class OrderCreateDto
    {
        public string CustomerName { get; set; } = string.Empty;
        public int? CustomerId { get; set; }
        public SimpleERP.Models.PaymentMethod PaymentMethod { get; set; } = SimpleERP.Models.PaymentMethod.Cash;
        public string? Notes { get; set; }
        public List<OrderItemCreateDto> Items { get; set; } = new List<OrderItemCreateDto>();
    }
}

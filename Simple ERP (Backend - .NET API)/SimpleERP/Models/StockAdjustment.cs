using System;

namespace SimpleERP.Models
{
    public enum StockAdjustmentType
    {
        Damage,
        Restock,
        Sale,
        Manual
    }

    public class StockAdjustment
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int QuantityChanged { get; set; }
        public StockAdjustmentType AdjustmentType { get; set; }
        public string? Reason { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public int? UserId { get; set; }

        // Navigation
        public Product? Product { get; set; }
        public ApplicationUser? User { get; set; }
    }
}

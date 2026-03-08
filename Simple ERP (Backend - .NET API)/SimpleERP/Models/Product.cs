using System;

namespace SimpleERP.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string? Barcode { get; set; } // For POS scanner integration
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public int LowStockThreshold { get; set; } = 5;
        public int CategoryId { get; set; }
        public int? SupplierId { get; set; } // Link to Supplier
        public string? ImageUrl { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();

        // Navigation
        public Category? Category { get; set; }
        public Supplier? Supplier { get; set; }
        public ICollection<OrderItem>? OrderItems { get; set; }
        public ICollection<StockAdjustment>? StockAdjustments { get; set; }
    }
}

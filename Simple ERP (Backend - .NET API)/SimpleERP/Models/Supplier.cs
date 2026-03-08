using System;
using System.Collections.Generic;

namespace SimpleERP.Models
{
    public class Supplier
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public decimal Rating { get; set; } // Supplier performance rating
        public string? SupplyCategory { get; set; }
        public bool IsActive { get; set; } = true;

        // Extended SRM metrics
        public int? LeadTimeDays { get; set; }
        public decimal OutstandingDebts { get; set; } = 0;
        public decimal TotalPaid { get; set; } = 0;
        public DateTime? LastOrderDate { get; set; }

        // Navigation
        public ICollection<Product>? Products { get; set; }
    }
}

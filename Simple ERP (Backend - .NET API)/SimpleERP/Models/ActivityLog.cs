using System;

namespace SimpleERP.Models
{
    public class ActivityLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? Changes { get; set; }

        public ApplicationUser? User { get; set; }
    }
}

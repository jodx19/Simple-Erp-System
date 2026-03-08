using Microsoft.AspNetCore.Identity;

namespace SimpleERP.Models
{
    // Application user that extends IdentityUser<int> to use int keys and add extra profile fields
    public class ApplicationUser : IdentityUser<int>
    {
        public string FullName { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? DeactivatedAt { get; set; }
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    }
}

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using SimpleERP.Models;

namespace SimpleERP.Data
{
    public class AuditSaveChangesInterceptor : SaveChangesInterceptor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditSaveChangesInterceptor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private int? GetCurrentUserId()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null) return null;
            var idClaim = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : (int?)null;
        }

        private AuditLog BuildAudit(EntityEntry entry, int? userId)
        {
            var now = DateTime.UtcNow;
            string entityName = entry.Metadata.ClrType.Name;
            string action = entry.State.ToString(); // Added, Modified, Deleted

            object? oldValues = null;
            object? newValues = null;

            if (entry.State == EntityState.Added)
            {
                newValues = entry.CurrentValues.ToObject();
            }
            else if (entry.State == EntityState.Deleted)
            {
                oldValues = entry.OriginalValues.ToObject();
            }
            else if (entry.State == EntityState.Modified)
            {
                oldValues = entry.OriginalValues.ToObject();
                newValues = entry.CurrentValues.ToObject();
            }

            var changes = JsonSerializer.Serialize(new { Old = oldValues, New = newValues }, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

            return new AuditLog
            {
                UserId = userId,
                Action = action,
                EntityName = entityName,
                Timestamp = now,
                Changes = changes
            };
        }

        public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
        {
            AddAuditLogs(eventData.Context);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            AddAuditLogs(eventData.Context);
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private void AddAuditLogs(DbContext? context)
        {
            if (context == null) return;

            // If there is no current HTTP context (e.g. running migrations or background tasks),
            // do not create audit logs here. This avoids FK/seeding conflicts when the
            // AspNetUsers rows may not yet exist while other entities are being inserted.
            if (_httpContextAccessor.HttpContext == null) return;

            var userId = GetCurrentUserId();

            var entries = context.ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)
                .Where(e => !(e.Entity is AuditLog)) // avoid self-logging
                .ToList();

            foreach (var entry in entries)
            {
                var audit = BuildAudit(entry, userId);
                context.Set<AuditLog>().Add(audit);
            }
        }
    }
}

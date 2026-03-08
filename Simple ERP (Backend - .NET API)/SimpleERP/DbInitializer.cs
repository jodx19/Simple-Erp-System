using Microsoft.AspNetCore.Identity;
using SimpleERP.Models;
using Microsoft.EntityFrameworkCore;
using SimpleERP.Data;

namespace SimpleERP
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();

            // 1. Ensure Roles
            var roles = new[] { "Admin", "Manager", "Employee" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole<int> { Name = role, NormalizedName = role.ToUpperInvariant() });
                }
            }

            // 2. Ensure Super Admin
            var adminEmail = "admin@example.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = "admin",
                    Email = adminEmail,
                    FullName = "Super Admin",
                    EmailConfirmed = true,
                    IsActive = true
                };
                await userManager.CreateAsync(adminUser, "Admin123!");
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }

            // 3. Ensure Company Settings
            if (!await context.CompanySettings.AnyAsync())
            {
                context.CompanySettings.Add(new CompanySettings
                {
                    CompanyName = "Simple ERP",
                    Currency = "USD",
                    Address = "123 ERP St."
                });
                await context.SaveChangesAsync();
            }
        }
    }
}

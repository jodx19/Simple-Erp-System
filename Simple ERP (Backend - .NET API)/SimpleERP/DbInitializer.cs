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

            // 2. Ensure Demo Accounts
            // Admin Account
            var adminEmail = "admin@erp.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = "admin",
                    Email = adminEmail,
                    FullName = "System Administrator",
                    EmailConfirmed = true,
                    IsActive = true
                };
                await userManager.CreateAsync(adminUser, "Admin123!");
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }

            // Manager Account
            var managerEmail = "manager@erp.com";
            var managerUser = await userManager.FindByEmailAsync(managerEmail);
            if (managerUser == null)
            {
                managerUser = new ApplicationUser
                {
                    UserName = "manager",
                    Email = managerEmail,
                    FullName = "Department Manager",
                    EmailConfirmed = true,
                    IsActive = true
                };
                await userManager.CreateAsync(managerUser, "Manager123!");
                await userManager.AddToRoleAsync(managerUser, "Manager");
            }

            // Employee Account
            var employeeEmail = "employee@erp.com";
            var employeeUser = await userManager.FindByEmailAsync(employeeEmail);
            if (employeeUser == null)
            {
                employeeUser = new ApplicationUser
                {
                    UserName = "employee",
                    Email = employeeEmail,
                    FullName = "Staff Employee",
                    EmailConfirmed = true,
                    IsActive = true
                };
                await userManager.CreateAsync(employeeUser, "Employee123!");
                await userManager.AddToRoleAsync(employeeUser, "Employee");
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

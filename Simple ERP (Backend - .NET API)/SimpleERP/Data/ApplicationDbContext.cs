using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SimpleERP.Models;

namespace SimpleERP.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // Suppress the EF Core 9 "Pending changes" warning which can be buggy during initial scaffolding
            optionsBuilder.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }

        // Domain DbSets
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<StockAdjustment> StockAdjustments { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<CompanySettings> CompanySettings { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Identity table name customizations (optional)
            modelBuilder.Entity<ApplicationUser>().ToTable("AspNetUsers");
            // Configure ApplicationUser additional properties
            modelBuilder.Entity<ApplicationUser>(b =>
            {
                b.Property(u => u.IsActive).HasDefaultValue(true);
                b.Property(u => u.DeactivatedAt).HasColumnType("datetime2").IsRequired(false);
                b.Property(u => u.RowVersion).IsRowVersion();
            });
            modelBuilder.Entity<IdentityRole<int>>().ToTable("AspNetRoles");
            modelBuilder.Entity<IdentityUserRole<int>>().ToTable("AspNetUserRoles");
            modelBuilder.Entity<IdentityUserClaim<int>>().ToTable("AspNetUserClaims");
            modelBuilder.Entity<IdentityUserLogin<int>>().ToTable("AspNetUserLogins");
            modelBuilder.Entity<IdentityRoleClaim<int>>().ToTable("AspNetRoleClaims");
            modelBuilder.Entity<IdentityUserToken<int>>().ToTable("AspNetUserTokens");

            // Configure decimal precision
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.UnitPrice)
                .HasColumnType("decimal(18,2)");

            // Unique constraints
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.SKU)
                .IsUnique();

            // Concurrency token: ensure SQL Server uses rowversion for Product.RowVersion
            modelBuilder.Entity<Product>()
                .Property(p => p.RowVersion)
                .IsRowVersion();

            // Relationships: Category -> Products (1-M)
            modelBuilder.Entity<Category>()
                .HasMany(c => c.Products)
                .WithOne(p => p.Category)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relationships: Order -> OrderItems (1-M)
            modelBuilder.Entity<Order>()
                .HasMany(o => o.Items)
                .WithOne(i => i.Order)
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // OrderItem -> Product (many-to-one)
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // StockAdjustment -> Product (many-to-one)
            modelBuilder.Entity<StockAdjustment>()
                .HasOne(sa => sa.Product)
                .WithMany(p => p.StockAdjustments)
                .HasForeignKey(sa => sa.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // AuditLog config
            modelBuilder.Entity<AuditLog>()
                .Property(a => a.Changes)
                .HasColumnType("nvarchar(max)");

            // Indexes to improve reporting/dashboard performance
            modelBuilder.Entity<Order>()
                .HasIndex(o => o.OrderDate);

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.SKU);

            modelBuilder.Entity<Order>()
                .HasIndex(o => o.UserId);

            // Configure Supplier Rating Precision
            modelBuilder.Entity<Supplier>()
                .Property(s => s.Rating)
                .HasColumnType("decimal(3,2)");

            // Relationships: Product -> Supplier (optional)
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Supplier)
                .WithMany(s => s.Products)
                .HasForeignKey(p => p.SupplierId)
                .OnDelete(DeleteBehavior.SetNull);

            // Relationships: Order -> Customer (optional)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.SetNull);

            // Seed Roles
            var adminRole = new IdentityRole<int> { Id = 1, Name = "Admin", NormalizedName = "ADMIN" };
            var managerRole = new IdentityRole<int> { Id = 2, Name = "Manager", NormalizedName = "MANAGER" };
            var employeeRole = new IdentityRole<int> { Id = 3, Name = "Employee", NormalizedName = "EMPLOYEE" };

            modelBuilder.Entity<IdentityRole<int>>().HasData(adminRole, managerRole, employeeRole);

            // Seed Admin User
            var adminUser = new ApplicationUser
            {
                Id = 1,
                UserName = "admin",
                NormalizedUserName = "ADMIN",
                Email = "admin@erp.com",
                NormalizedEmail = "ADMIN@ERP.COM",
                EmailConfirmed = true,
                FullName = "System Administrator",
                SecurityStamp = Guid.NewGuid().ToString("D")
            };

            var hasher = new PasswordHasher<ApplicationUser>();
            adminUser.PasswordHash = hasher.HashPassword(adminUser, "Admin@123");

            modelBuilder.Entity<ApplicationUser>().HasData(adminUser);

            // Assign Admin role to user
            modelBuilder.Entity<IdentityUserRole<int>>().HasData(new IdentityUserRole<int>
            {
                RoleId = adminRole.Id,
                UserId = adminUser.Id
            });

            // Seed Company Settings (keep existing seed)
            modelBuilder.Entity<CompanySettings>().HasData(new CompanySettings
            {
                Id = 1,
                CompanyName = "Simple ERP Corp",
                Address = "123 Enterprise St",
                Currency = "USD",
                LogoUrl = ""
            });

            // Seed Initial Customer
            modelBuilder.Entity<Customer>().HasData(new Customer
            {
                Id = 1,
                Name = "Walk-in Customer",
                IsActive = true
            });

            // Seed Initial Supplier
            modelBuilder.Entity<Supplier>().HasData(new Supplier
            {
                Id = 1,
                Name = "Main Warehouse",
                ContactPerson = "John Doe",
                IsActive = true
            });

            // Optional: seed initial categories and products (IDs must be deterministic)
            modelBuilder.Entity<Category>().HasData(new Category { Id = 1, Name = "Electronics", Description = "Electronic devices" });
            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "Laptop", SKU = "LAP-001", Description = "Standard laptop", Price = 1200m, StockQuantity = 10, LowStockThreshold = 5, CategoryId = 1, CreatedDate = DateTime.UtcNow },
                new Product { Id = 2, Name = "Mouse", SKU = "MOU-001", Description = "USB Mouse", Price = 25m, StockQuantity = 50, LowStockThreshold = 5, CategoryId = 1, CreatedDate = DateTime.UtcNow }
            );
        }
    }
}

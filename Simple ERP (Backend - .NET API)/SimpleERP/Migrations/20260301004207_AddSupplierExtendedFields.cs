using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SimpleERP.Migrations
{
    /// <inheritdoc />
    public partial class AddSupplierExtendedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "Suppliers",
                newName: "SupplyCategory");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "Suppliers",
                newName: "PhoneNumber");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastOrderDate",
                table: "Suppliers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LeadTimeDays",
                table: "Suppliers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "OutstandingDebts",
                table: "Suppliers",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Rating",
                table: "Suppliers",
                type: "decimal(3,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalPaid",
                table: "Suppliers",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "41d0a3a2-c27b-46a8-a30e-ba27124e32e5", "AQAAAAIAAYagAAAAEEPPfqRI4PiG/pgVb5Os3BFjavoHHwldquAWNiQ1jd0rLKqJ+c/sl6W5A2tUzyg6cg==", "8f7e610f-4648-459c-9237-5391b5b9bf58" });

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 1, 0, 42, 3, 581, DateTimeKind.Utc).AddTicks(2474));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 1, 0, 42, 3, 582, DateTimeKind.Utc).AddTicks(1676));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedDate",
                value: new DateTime(2026, 3, 1, 0, 42, 3, 582, DateTimeKind.Utc).AddTicks(2025));

            migrationBuilder.UpdateData(
                table: "Suppliers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "LastOrderDate", "LeadTimeDays", "OutstandingDebts", "Rating", "TotalPaid" },
                values: new object[] { null, null, 0m, 0m, 0m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastOrderDate",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "LeadTimeDays",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "OutstandingDebts",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "TotalPaid",
                table: "Suppliers");

            migrationBuilder.RenameColumn(
                name: "SupplyCategory",
                table: "Suppliers",
                newName: "Phone");

            migrationBuilder.RenameColumn(
                name: "PhoneNumber",
                table: "Suppliers",
                newName: "Category");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "b9150040-82ce-4db2-a791-2624ede6c656", "AQAAAAIAAYagAAAAEArlCFR8oNDVpHSsaZbiVkxBAuqucxAePhdfh6JghNr9S6YAR8Sc+HCihsmqgFq6mA==", "b48172b5-f1b8-4458-b2d9-b25349f89ddb" });

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 28, 3, 8, 11, 894, DateTimeKind.Utc).AddTicks(2826));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2026, 2, 28, 3, 8, 11, 895, DateTimeKind.Utc).AddTicks(3251));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedDate",
                value: new DateTime(2026, 2, 28, 3, 8, 11, 895, DateTimeKind.Utc).AddTicks(3614));
        }
    }
}

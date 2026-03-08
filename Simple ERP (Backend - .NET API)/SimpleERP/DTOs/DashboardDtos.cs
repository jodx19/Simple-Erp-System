namespace SimpleERP.DTOs
{
    public class DailySaleDto
    {
        public System.DateTime Date { get; set; }
        public decimal Amount { get; set; }
    }

    public class DashboardStatsDto
    {
        public int TotalProducts { get; set; }
        public decimal TotalStockValue { get; set; }
        public int OutOfStockCount { get; set; }
        public decimal TodaySales { get; set; }
        public int RecentOrdersCount { get; set; }
        public System.Collections.Generic.List<DailySaleDto> SalesTrends { get; set; } = new();
    }
}

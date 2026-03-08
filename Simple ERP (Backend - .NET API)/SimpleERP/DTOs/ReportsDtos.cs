namespace SimpleERP.DTOs
{
    public class SalesReportDto
    {
        public DateTime Date { get; set; }
        public decimal TotalAmount { get; set; }
        public int OrdersCount { get; set; }
    }

    public class SalesReportRequestDto
    {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
    }
}

namespace SimpleERP.Models
{
    public class CompanySettings
    {
        public int Id { get; set; }
        public string CompanyName { get; set; } = "Simple ERP Corp";
        public string Address { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string Currency { get; set; } = "USD";
    }
}

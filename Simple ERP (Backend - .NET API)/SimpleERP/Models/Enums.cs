namespace SimpleERP.Models
{
    public enum UserRole
    {
        Admin,
        Manager,
        Employee
    }

    public enum OrderStatus
    {
        Pending,
        Processing,
        Shipped,
        Delivered,
        Cancelled
    }

    public enum PaymentMethod
    {
        Cash,
        CreditCard,
        Wallet,
        BankTransfer
    }
}

using Microsoft.AspNetCore.SignalR;

namespace SimpleERP.Hubs
{
    public class OrderHub : Hub
    {
        // Clients can listen for "NewOrderReceived" event
        // This hub acts as a relay for real-time notifications
    }
}

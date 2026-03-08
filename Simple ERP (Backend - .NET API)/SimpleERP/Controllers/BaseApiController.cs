using Microsoft.AspNetCore.Mvc;

namespace SimpleERP.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
        protected int? GetUserId()
        {
            var idClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
            return idClaim != null ? int.Parse(idClaim.Value) : null;
        }
    }
}

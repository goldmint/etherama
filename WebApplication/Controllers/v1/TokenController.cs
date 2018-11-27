using System.Linq;
using System.Threading.Tasks;
using Etherama.Common;
using Etherama.WebApplication.Core.Policies;
using Etherama.WebApplication.Core.Response;
using Etherama.WebApplication.Models.API.v1;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Etherama.WebApplication.Controllers.v1
{
    [Route("api/v1/token")]
    public class TokenController : BaseController
    {
        [AnonymousAccess]
        [HttpGet, Route("list")]
        [ProducesResponseType(typeof(string[]), 200)]
        public async Task<APIResponse> GetTokens()
        {
            var query = DbContext.Tokens.Where(x => x.IsEnabled && !x.IsDeleted);

            return APIResponse.Success(await query.AsNoTracking().ToArrayAsync());
        }


        [AnonymousAccess]
        [HttpGet, Route("stat")]
        [ProducesResponseType(typeof(string[]), 200)]
        public async Task<APIResponse> GetTokenStatistics(TokenStatisticsModel model)
        {
            var dateFrom = Utils.UnixTimestampToDateTime(model.DateFrom);

            var query = DbContext.TokenStatistics.Where(x => x.TokenId == model.TokenId && x.Date > dateFrom);

            return APIResponse.Success(await query.AsNoTracking().ToArrayAsync());
        }
    }
}

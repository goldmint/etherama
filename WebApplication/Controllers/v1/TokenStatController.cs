using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Etherama.WebApplication.Core.Policies;
using Etherama.WebApplication.Core.Response;
using Etherama.WebApplication.Models.API.v1;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Etherama.WebApplication.Controllers.v1
{
    [Route("api/v1/token-stat")]
    public class TokenStatController : BaseController
    {
        /// <summary>
        /// Countries blacklist
        /// </summary>
        [AnonymousAccess]
        [HttpGet, Route("stat")]
        [ProducesResponseType(typeof(string[]), 200)]
        public async Task<APIResponse> GetTokenStatistics(TokenStatisticsModel model)
        {

            var query = DbContext.TokenStatistics.Where(x => x.TokenId == model.TokenId);
            
            return APIResponse.Success(query.AsNoTracking().ToArrayAsync());
        }
    }
}

﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Etherama.Common;
using Etherama.DAL.Models;
using Etherama.WebApplication.Core.Policies;
using Etherama.WebApplication.Core.Response;
using Etherama.WebApplication.Models.API.v1.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Etherama.WebApplication.Controllers.v1
{
    [Route("api/v1/token")]
    public class TokenController : BaseController
    {
        [AnonymousAccess]
        [HttpGet, Route("list")]
        [ProducesResponseType(typeof(TokenBaseInfoResponseViewModel[]), 200)]
        public async Task<APIResponse> GetTokenList()
        {
            var query = DbContext.Tokens.Where(x => x.IsEnabled && !x.IsDeleted);

            var list = new List<TokenBaseInfoResponseViewModel>();

            (await query.AsNoTracking().ToListAsync()).ForEach(x => list.Add(Mapper.Map<TokenBaseInfoResponseViewModel>(x)));

            foreach (var token in list)
            {
                var last7DStatList = await DbContext.TokenStatistics.Where(x => x.TokenId == token.Id && x.Date >= DateTime.Now.AddDays(-7)).ToListAsync();

                var lastStatPrice = last7DStatList.LastOrDefault()?.PriceEth ?? token.StartPriceEth;

                token.PriceChangeLastDayPercent = ((token.CurrentPriceEth - lastStatPrice) / lastStatPrice) * 100;
                token.PriceStatistics7D = last7DStatList.Select(x => x.PriceEth).ToList();
            }

            return APIResponse.Success(list);
        }

        [AnonymousAccess]
        [HttpGet, Route("full-info")]
        [ProducesResponseType(typeof(TokenFullInfoResponseViewModel[]), 200)]
        public async Task<APIResponse> GetTokenFullInfo(RequestByIdViewModel viewModel)
        {
            var item = await DbContext.Tokens.FirstOrDefaultAsync(x => x.Id == viewModel.Id && x.IsEnabled && !x.IsDeleted);

            var res = Mapper.Map<TokenFullInfoResponseViewModel>(item);

            return APIResponse.Success(res);
        }

        [AnonymousAccess]
        [HttpGet, Route("stat")]
        [ProducesResponseType(typeof(TokenStatisticsResponseViewModel[]), 200)]
        public async Task<APIResponse> GetTokenStatistics(TokenStatisticsRequestViewModel viewModel)
        {
            var query = DbContext.TokenStatistics.Where(x => x.TokenId == viewModel.Id && x.Date >= Utils.UnixTimestampToDateTime(viewModel.DateFrom));

            if (viewModel.DateTo > 0) query = query.Where(x => x.Date <= Utils.UnixTimestampToDateTime(viewModel.DateTo));
            
            var list = new List<TokenStatisticsResponseViewModel>();

            (await query.AsNoTracking().ToListAsync()).ForEach(x => list.Add(Mapper.Map<TokenStatisticsResponseViewModel>(x)));

            return APIResponse.Success(list);
        }

        [AnonymousAccess]
        [HttpPost, Route("add-request")]
        public async Task<APIResponse> AddRequest([FromBody] AddTokenRequestViewModel viewModel)
        {
            var model = Mapper.Map<AddTokenRequest>(viewModel);

            model.IsEnabled = true;
            model.TimeCreated = DateTime.Now;

            DbContext.AddTokenRequests.Add(model);

            await DbContext.SaveChangesAsync();

            return APIResponse.Success();
        }
    }
}

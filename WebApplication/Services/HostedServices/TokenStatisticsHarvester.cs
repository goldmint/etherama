using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Etherama.DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace Etherama.WebApplication.Services.HostedServices
{
    public class TokenStatisticsHarvester : BaseHostedService
    {
        protected override TimeSpan Period => TimeSpan.FromDays(1);

        public TokenStatisticsHarvester(IServiceProvider services) : base(services) { }

        private List<Token> _tokenList;


        protected override async Task OnInit()
        {
            await base.OnInit();

            _tokenList = await DbContext.Tokens.Where(x => x.IsEnabled && !x.IsDeleted).ToListAsync();

        }

        protected override async void DoWork(object state)
        {
            foreach (var token in _tokenList)
            {
                var price = await EthereumObserver.GetTokenPrice(token.EtheramaContractAddress);
                var buyCount = await EthereumObserver.GetBuyCount(token.EtheramaContractAddress);
                var sellCount = await EthereumObserver.GetSellCount(token.EtheramaContractAddress);
                var bonusPerShare = await EthereumObserver.GetBonusPerShare(token.EtheramaContractAddress);

                var tokenStat = new TokenStatistics { Date = DateTime.Now, PriceEth = price, BuyCount = buyCount, SellCount = sellCount, ShareReward = bonusPerShare, TokenId = token.Id };

                await DbContext.TokenStatistics.AddAsync(tokenStat);
            }

            await DbContext.SaveChangesAsync();
        }

    }
}

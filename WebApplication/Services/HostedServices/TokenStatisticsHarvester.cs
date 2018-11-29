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
        private List<Token> _tokenList;


        public TokenStatisticsHarvester(IServiceProvider services) : base(services) { }


        protected override async Task OnInit()
        {
            await base.OnInit();

            _tokenList = await DbContext.Tokens.Where(x => x.IsEnabled && !x.IsDeleted).ToListAsync();
        }

        protected override async void DoWork(object state)
        {
            foreach (var token in _tokenList)
            {
                var lastStat = await DbContext.TokenStatistics.LastOrDefaultAsync(x => x.TokenId == token.Id);

                if (Math.Abs(lastStat?.Date.Subtract(DateTime.Now).Days ?? 1) < 1) continue; 

                var price = await EthereumObserver.GetTokenPrice(token.EtheramaContractAddress);
                var buyCount = await EthereumObserver.GetBuyCount(token.EtheramaContractAddress);
                var sellCount = await EthereumObserver.GetSellCount(token.EtheramaContractAddress);
                var bonusPerShare = await EthereumObserver.GetBonusPerShare(token.EtheramaContractAddress);
                var volumeEth = await EthereumObserver.GetVolumeEth(token.EtheramaContractAddress);
                var volumeToken = await EthereumObserver.GetVolumeToken(token.EtheramaContractAddress);
                var blockNum = await EthereumObserver.GetLogsLatestBlockNumber();

                var tokenStat = new TokenStatistics { Date = DateTime.Now, PriceEth = price, BuyCount = buyCount, SellCount = sellCount,
                    ShareReward = bonusPerShare, VolumeEth = volumeEth, VolumeToken = volumeToken, BlockNum = blockNum, TokenId = token.Id };

                await DbContext.TokenStatistics.AddAsync(tokenStat);
            }

            await DbContext.SaveChangesAsync();
        }

    }
}

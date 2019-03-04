using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Etherama.DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace Etherama.WebApplication.Services.HostedServices {

	public class TokenStatisticsHarvester : BaseHostedService {

		protected override TimeSpan Period => TimeSpan.FromMinutes(5);

		public TokenStatisticsHarvester(IServiceProvider services) : base(services) { }

		protected override async Task OnInit() {
			await base.OnInit();
		}

		protected override async Task DoWork() {
			
			//DbContext.DetachEverything();
			var tokenList = await DbContext.Tokens.Where(x => x.IsEnabled && !x.IsDeleted).ToListAsync();
			var thisDayStart = DayStartOf(DateTime.Now);

			foreach (var token in tokenList) {

				var lastStat = await DbContext.TokenStatistics.LastOrDefaultAsync(x => x.TokenId == token.Id);
				var add = lastStat == null || lastStat.Date != thisDayStart;

				var price = await EthereumObserver.GetTokenPrice(token.EtheramaContractAddress);
				var buyCount = await EthereumObserver.GetBuyCount(token.EtheramaContractAddress);
				var sellCount = await EthereumObserver.GetSellCount(token.EtheramaContractAddress);
				var bonusPerShare = await EthereumObserver.GetBonusPerShare(token.EtheramaContractAddress);
				var volumeEth = await EthereumObserver.GetVolumeEth(token.EtheramaContractAddress);
				var volumeToken = await EthereumObserver.GetVolumeToken(token.EtheramaContractAddress);
				var blockNum = await EthereumObserver.GetLogsLatestBlockNumber();

				if (add) {
					var tokenStat = new TokenStatistics {
						Date = thisDayStart,
						PriceEth = price,
						BuyCount = buyCount,
						SellCount = sellCount,
						ShareReward = bonusPerShare,
						VolumeEth = volumeEth,
						VolumeToken = volumeToken,
						BlockNum = blockNum,
						TokenId = token.Id
					};
					await DbContext.TokenStatistics.AddAsync(tokenStat);
				}
				else {
					lastStat.PriceEth = price;
					lastStat.BuyCount = buyCount;
					lastStat.SellCount = sellCount;
					lastStat.ShareReward = bonusPerShare;
					lastStat.VolumeEth = volumeEth;
					lastStat.VolumeToken = volumeToken;
					lastStat.BlockNum = blockNum;
				}
			}

			await DbContext.SaveChangesAsync();
		}

		private DateTime DayStartOf(DateTime t) {
			return new DateTime(t.Year, t.Month, t.Day, 0, 0, 0, t.Kind);
		}
	}
}

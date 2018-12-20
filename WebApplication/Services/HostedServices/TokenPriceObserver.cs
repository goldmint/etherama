using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Etherama.DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace Etherama.WebApplication.Services.HostedServices
{
    public class TokenPriceObserver : BaseHostedService
    {
        protected override TimeSpan Period => TimeSpan.FromMinutes(5);

        public TokenPriceObserver(IServiceProvider services) : base(services) { }

        protected override async Task OnInit()
        {
            await base.OnInit();
        }

        protected override async void DoWork(object state)
        {
			var tokenList = await DbContext.Tokens.Where(x => x.IsEnabled && !x.IsDeleted).ToListAsync();
			
            foreach (var token in tokenList)
            {
                token.CurrentPriceEth = await EthereumObserver.GetTokenPrice(token.EtheramaContractAddress);
                token.TimeUpdated = DateTime.Now;
            }

            await DbContext.SaveChangesAsync();
			DbContext.DetachEverything();
        }
    }
}

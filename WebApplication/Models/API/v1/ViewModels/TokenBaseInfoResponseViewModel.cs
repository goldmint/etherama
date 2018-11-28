
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Etherama.WebApplication.Models.API.v1.ViewModels
{
    public class TokenBaseInfoResponseViewModel
    {
        public long Id { get; set; }

        public string TokenContractAddress { get; set; }

        public string EtheramaContractAddress { get; set; }

        public string FullName { get; set; }

        public string Ticker { get; set; }

        public string LogoUrl { get; set; }

        public decimal CurrentPriceEth { get; set; }

        public decimal Change24HPercent { get; set; }

        public decimal TradingVolume24HEth { get; set; }

        public List<decimal> PriceStatistics7D { get; set; }
    }
}

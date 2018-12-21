using System;
using System.Threading;
using System.Threading.Tasks;

namespace Etherama.WebApplication.Services.HostedServices {

	public class MaxGasPriceUpdater : BaseHostedService {

		protected override TimeSpan Period => TimeSpan.FromMinutes(20);

		public MaxGasPriceUpdater(IServiceProvider services) : base(services) { }

		protected override async Task DoWork() {
			var gasPrice = await EthereumObserver.GetCurrentGasPrice();
			await EthereumWriter.UpdateMaxGaxPrice(gasPrice);
		}
	}
}

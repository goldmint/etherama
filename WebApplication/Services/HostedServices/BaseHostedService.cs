using System;
using System.Threading;
using System.Threading.Tasks;
using Etherama.Common;
using Etherama.Common.Extensions;
using Etherama.CoreLogic.Services.Blockchain.Ethereum;
using Etherama.DAL;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NLog;

namespace Etherama.WebApplication.Services.HostedServices
{
	public abstract class BaseHostedService : IHostedService, IDisposable
	{
		protected AppConfig AppConfig { get; }
		protected ILogger Logger { get; }
		protected ApplicationDbContext DbContext { get; }
		protected IEthereumReader EthereumObserver { get; }
	    protected IEthereumWriter EthereumWriter { get; }

        protected abstract TimeSpan Period { get; }

		private Timer _timer;

		protected BaseHostedService(IServiceProvider services) {
			Logger = services.GetLoggerFor(this.GetType());
			AppConfig = services.GetRequiredService<AppConfig>();
			DbContext = services.GetRequiredService<ApplicationDbContext>();
			EthereumObserver = services.GetRequiredService<IEthereumReader>();
		    EthereumWriter = services.GetRequiredService<IEthereumWriter>();
		}

		public async Task StartAsync(CancellationToken cancellationToken) {
			await OnInit();

			_timer = new Timer(DoWork, null, TimeSpan.Zero, Period);
		}

		public Task StopAsync(CancellationToken cancellationToken) {
			_timer?.Change(Timeout.Infinite, 0);
			return Task.CompletedTask;
		}

		protected abstract void DoWork(object state);

		protected virtual Task OnInit() {
			return Task.CompletedTask;
		}

		public void Dispose() {
			_timer?.Dispose();
		}

	}
}

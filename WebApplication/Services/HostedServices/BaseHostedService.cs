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

namespace Etherama.WebApplication.Services.HostedServices {

	public abstract class BaseHostedService : IHostedService, IDisposable {

		protected AppConfig AppConfig { get; }
		protected ILogger Logger { get; }
		protected ApplicationDbContext DbContext { get; }
		protected IEthereumReader EthereumObserver { get; }
		protected IEthereumWriter EthereumWriter { get; }

		protected abstract TimeSpan Period { get; }
		private Task _task;
		private readonly CancellationTokenSource _cts = new CancellationTokenSource();

		protected BaseHostedService(IServiceProvider services) {
			Logger = services.GetLoggerFor(this.GetType());
			AppConfig = services.GetRequiredService<AppConfig>();
			DbContext = services.GetRequiredService<ApplicationDbContext>();
			EthereumObserver = services.GetRequiredService<IEthereumReader>();
			EthereumWriter = services.GetRequiredService<IEthereumWriter>();
		}

		public void Dispose() {
		}

		public Task StartAsync(CancellationToken cancellationToken) {
			_task = ExecuteAsync(_cts.Token);
			return _task.IsCompleted ? _task : Task.CompletedTask;
		}

		public async Task StopAsync(CancellationToken cancellationToken) {
			if (_task == null) {
				return;
			}
			try {
				_cts.Cancel();
			}
			finally {
				await Task.WhenAny(_task, Task.Delay(Timeout.Infinite, cancellationToken));
			}
		}

		private async Task ExecuteAsync(CancellationToken cancellationToken) {
			await OnInit();

			while (!cancellationToken.IsCancellationRequested) {
				try {
					await DoWork();
				} catch (Exception e) {
					Logger.Error(e, "Hosted service failure");
				}
				await Task.Delay(Period, cancellationToken);
			}
		}

		protected virtual Task OnInit() => Task.CompletedTask;
		protected abstract Task DoWork();
	}
}

using Etherama.Common;
using Etherama.DAL;
using NLog;
using System;
using System.Threading.Tasks;
using Etherama.Common.Extensions;

namespace Etherama.CoreLogic.Services.Notification.Impl {

	public class DBNotificationQueue : INotificationQueue {

		private ApplicationDbContext _dbContext;
		private ILogger _logger;

		public DBNotificationQueue(ApplicationDbContext dbContext, LogFactory logFactory) {
			_dbContext = dbContext;
			_logger = logFactory.GetLoggerFor(this);
		}

		public async Task<bool> Enqueue(BaseNotification notification) {
			return await Enqueue(notification, DateTime.UtcNow);
		}

		public Task<bool> Enqueue(BaseNotification notification, DateTime timeToSend) {
			return Task.FromResult(true);
		}
	}
}

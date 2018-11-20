using System;
using System.Threading.Tasks;

namespace Etherama.CoreLogic.Services.Notification.Impl {

	public class NullNotificationQueue : INotificationQueue {

		public Task<bool> Enqueue(BaseNotification notification) {
			return Task.FromResult(true);
		}

		public Task<bool> Enqueue(BaseNotification notification, DateTime timeToSend) {
			return Task.FromResult(true);
		}
	}
}

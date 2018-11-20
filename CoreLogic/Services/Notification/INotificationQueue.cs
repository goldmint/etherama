using System;
using System.Threading.Tasks;

namespace Etherama.CoreLogic.Services.Notification {

	public interface INotificationQueue {

		Task<bool> Enqueue(BaseNotification notification);
		Task<bool> Enqueue(BaseNotification notification, DateTime timeToSend);
	}
}

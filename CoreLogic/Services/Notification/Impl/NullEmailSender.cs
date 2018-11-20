using System.Threading.Tasks;

namespace Etherama.CoreLogic.Services.Notification.Impl {

	public sealed class NullEmailSender : IEmailSender {

		public Task<bool> Send(EmailNotification notification) {
			return Task.FromResult(true);
		}
	}
}

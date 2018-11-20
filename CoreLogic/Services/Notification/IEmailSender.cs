using System.Threading.Tasks;

namespace Etherama.CoreLogic.Services.Notification {

	public interface IEmailSender {

		Task<bool> Send(EmailNotification notification);
	}
}

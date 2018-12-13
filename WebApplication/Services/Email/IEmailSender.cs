using System.Threading.Tasks;

namespace Etherama.WebApplication.Services.Email {

	public interface IEmailSender {

		Task<bool> Send(string[] recipients, string subject, string body);
	}
}

using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Etherama.CoreLogic.Services.KYC {

	public interface IKycProvider {

		Task<string> GetRedirect(UserData user, string ticketId, string userRedirectUrl, string callbackUrl);
		Task<CallbackResult> OnServiceCallback(HttpRequest content);
	}
}

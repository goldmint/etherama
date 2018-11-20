using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Etherama.WebApplication.Services.OAuth {

	public interface IOAuthProvider {

		Task<string> GetRedirect(string callbackUrl, long? userId);

		Task<UserInfo> GetUserInfo(string callbackUrl, string oauthState, string oauthCode);

	}
}

using Etherama.CoreLogic.Services.Localization;
using Etherama.CoreLogic.Services.Notification.Impl;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Etherama.WebApplication.Core;
using Etherama.WebApplication.Core.Policies;
using Etherama.WebApplication.Core.Response;
using Etherama.WebApplication.Core.Tokens;
using Etherama.WebApplication.Models.API;
using Etherama.WebApplication.Models.API.v1.RegisterModels;
using Etherama.Common;

namespace Etherama.WebApplication.Controllers.v1 {

	[Route("api/v1/register")]
	public class RegisterController : BaseController {

		/// <summary>
		/// Start registration flow with email and password
		/// </summary>
		[AnonymousAccess]
		[HttpPost, Route("register")]
		[ProducesResponseType(typeof(object), 200)]
		public async Task<APIResponse> Register([FromBody] RegisterModel model) {

			// validate
			if (BaseValidableModel.IsInvalid(model, out var errFields)) {
				return APIResponse.BadRequest(errFields);
			}

			var agent = GetUserAgentInfo();
			var audience = JwtAudience.Cabinet;
			var userLocale = GetUserLocale();

			// captcha
			if (!HostingEnvironment.IsDevelopment()) {
				if (!await Recaptcha.Verify(AppConfig.Services.Recaptcha.SecretKey, model.Captcha, agent.Ip)) {
					return APIResponse.BadRequest(nameof(model.Captcha), "Failed to validate captcha");
				}
			}

			var result = await Core.UserAccount.CreateUserAccount(HttpContext.RequestServices, model.Email, model.Password);

			if (result.User != null) {

				var jwtSalt = UserAccount.CurrentJwtSalt(result.User, audience);
					
				var tokenForDpa = JWT.CreateSecurityToken(
					appConfig: AppConfig,
					entityId: result.User.UserName,
					audience: audience,
					securityStamp: jwtSalt,
					area: JwtArea.Dpa,
					validFor: TimeSpan.FromDays(1)
				);

				// send dpa
				await DbContext.Entry(result.User).Reference(_ => _.UserOptions).LoadAsync();

				return APIResponse.Success();
			}

		    if (result.IsUsernameExists || result.IsEmailExists) {
		        return APIResponse.BadRequest(APIErrorCode.AccountEmailTaken, "Email is already taken");
		    }

		    throw new Exception("Registration failed");
		}

		/*
		/// <summary>
		/// Email confirmation while registration
		/// </summary>
		[AnonymousAccess]
		[HttpPost, Route("confirm")]
		[ProducesResponseType(typeof(object), 200)]
		public async Task<APIResponse> Confirm([FromBody] ConfirmModel model) {

			// validate
			if (BaseValidableModel.IsInvalid(model, out var errFields)) {
				return APIResponse.BadRequest(errFields);
			}

			var audience = JwtAudience.Cabinet;
			var user = (DAL.Models.Identity.User)null;
			var agent = GetUserAgentInfo();
			var userLocale = GetUserLocale();

			// check token
			if (! await Core.Tokens.JWT.IsValid(
				appConfig: AppConfig, 
				jwtToken: model.Token, 
				expectedAudience: audience,
				expectedArea: Common.JwtArea.Registration,
				validStamp: async (jwt, id) => {
					user = await UserManager.FindByNameAsync(id);
					return user?.JwtSalt;
				}
			) || user == null) {
				return APIResponse.BadRequest(nameof(model.Token), "Invalid token");
			}

			user.EmailConfirmed = true;
			user.JwtSalt = Core.UserAccount.GenerateJwtSalt();
			await DbContext.SaveChangesAsync();

			// load user's options
			await DbContext.Entry(user).Reference(_ => _.UserOptions).LoadAsync();

			// send dpa
			await Core.UserAccount.ResendUserDpaDocument(
				locale: userLocale,
				services: HttpContext.RequestServices,
				user: user,
				email: user.Email,
				redirectUrl: this.MakeAppLink(audience, fragment: AppConfig.Apps.Cabinet.RouteDpaSigned)
			);

			return APIResponse.Success();
		}
		*/
	}
}

using Etherama.Common;
using Etherama.Common.WebRequest;
using NLog;
using System;
using System.Threading.Tasks;
using Etherama.Common.Extensions;

namespace Etherama.CoreLogic.Services.Notification.Impl {

	public sealed class MailGunSender : IEmailSender {

		private AppConfig _appConfig;
		private ILogger _logger;

		public MailGunSender(AppConfig appConfig, LogFactory logFactory) {
			_logger = logFactory.GetLoggerFor(this);
			_appConfig = appConfig;
		}

		public async Task<bool> Send(EmailNotification noti) {
			var ret = false;

			var url = _appConfig.Services.MailGun.Url.TrimEnd('/', ' ') + "/" + _appConfig.Services.MailGun.DomainName.TrimEnd('/', ' ') + "/messages";

			var postParams = new Parameters()
				.Set("from", $"{_appConfig.Services.MailGun.Sender}")
				.Set("to", $"{noti.RecipientName} <{noti.Recipient}>")
				.Set("subject", $"{noti.Subject}")
				.Set("html", $"{noti.Body}")
			;

			using (var req = new Request(_logger)) {
				await req
					.AcceptJson()
					.AuthBasic("api:" + _appConfig.Services.MailGun.Key, true)
					.BodyForm(postParams)
					.OnResult(async (res) => {
						if (res.GetHttpStatus() != System.Net.HttpStatusCode.OK) {
							_logger?.Error("Message has not been sent to `{0}` with subject `{1}`. Status {2}. Raw: `{3}`", noti.Recipient, noti.Subject, res.GetHttpStatus(), await res.ToRawString());
						} else {
							ret = true;
						}
					})
					.SendPost(url, TimeSpan.FromSeconds(90))
				;
			}

			return ret;
		}
	}
}

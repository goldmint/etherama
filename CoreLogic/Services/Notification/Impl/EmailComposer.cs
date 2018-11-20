using System;
using System.Threading.Tasks;
using Etherama.CoreLogic.Services.Localization;
using Etherama.DAL.Models;

namespace Etherama.CoreLogic.Services.Notification.Impl {

	public class EmailComposer {

		private readonly EmailNotification _email;

		public EmailComposer() {
			_email = new EmailNotification() {
			};
		}

		public static EmailComposer FromTemplate(string subject, string body) {
			var ret = new EmailComposer() {};
			ret.SetSubject(subject);
			ret.SetBody(body);
			return ret;
		}

		public static EmailComposer FromTemplate(EmailTemplate template) {
			var ret = new EmailComposer() {};
			ret.SetSubject(template.Subject);
			ret.SetBody(template.Body);
			return ret;
		}

		public EmailComposer ReplaceBodyTag(string tag, string value) {
			_email.Body = _email.Body?.Replace("{{" + tag + "}}", value);
			return this;
		}

		// ---

		public EmailComposer Initiator(string ip, string agent, DateTime time) {
			var timeFmt = time.ToString("G") + " UTC";
			ReplaceBodyTag("INITIATOR", $"<small><b>IP:</b> {ip} <br><br><b>Agent:</b> {agent} <br><br><b>Time:</b> {timeFmt}</small>");
			return this;
		}

		public EmailComposer Initiator(UserActivity uac) {
			return this.Initiator(
				uac?.Ip,
				uac?.Agent,
				uac?.TimeCreated ?? DateTime.UtcNow
			);
		}

		public EmailComposer Username(string username) {
			ReplaceBodyTag("USERNAME", username);
			return this;
		}

		public EmailComposer Link(string link) {
			ReplaceBodyTag("LINK", link);
			return this;
		}

		public EmailComposer SetSubject(string subject) {
			_email.Subject = subject;
			return this;
		}

		public EmailComposer SetBody(string body) {
			_email.Body = body;
			return this;
		}

		public async Task<bool> Send(string address, string username, INotificationQueue queue) {
			_email.Recipient = address;

			ReplaceBodyTag("HEAD", HtmlHeadStyles);
			ReplaceBodyTag("USERNAME", username);

			return await queue.Enqueue(_email);
		}

		private const string HtmlHeadStyles = "<style>html,body {margin: 0 auto !important;padding: 0 !important;height: 100% !important;width: 100% !important;}* {-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;}div[style*=\"margin: 16px 0\"] {margin: 0 !important;}table,td {mso-table-lspace: 0pt !important;mso-table-rspace: 0pt !important;}table {border-spacing: 0 !important;border-collapse: collapse !important;table-layout: fixed !important;margin: 0 auto !important;}table table table {table-layout: auto;}img {-ms-interpolation-mode: bicubic;}*[x-apple-data-detectors],.x-gmail-data-detectors,.x-gmail-data-detectors *,.aBn {border-bottom: 0 !important;cursor: default !important;color: inherit !important;text-decoration: none !important;font-size: inherit !important;font-family: inherit !important;font-weight: inherit !important;line-height: inherit !important;}.a6S {display: none !important;opacity: 0.01 !important;}img.g-img + div {display: none !important;}.button-link {text-decoration: none !important;}@media only screen and (min-device-width: 320px) and (max-device-width: 374px) {.email-container {min-width: 320px !important;}}@media only screen and (min-device-width: 375px) and (max-device-width: 413px) {.email-container {min-width: 375px !important;}}@media only screen and (min-device-width: 414px) {.email-container {min-width: 414px !important;}}</style><style>@media screen and (max-width: 600px) {.email-container p {font-size: 17px !important;}} a { color: #0093E5; } a:visited { color: #0093E5; }</style><!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->";
	}
}

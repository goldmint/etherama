using Etherama.Common;
using NLog;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Etherama.Common.Extensions;

namespace Etherama.CoreLogic.Services.Localization.Impl {

	public sealed class TemplateProvider : ITemplateProvider {

		public static readonly string[] ValidExtensions = { "html" };

		private readonly ILogger _logger;
		private readonly Dictionary<string, string> _resources;

		public TemplateProvider(LogFactory logFactory) {
			_logger = logFactory.GetLoggerFor(this);
			_resources = new Dictionary<string, string>();
			LoadUp();
		}

		public Task<EmailTemplate> GetEmailTemplate(string name, Locale? locale) {
			var body = "";
			var subj = "goldmint.io"; // placeholder
			var localeStr = (locale ?? Locale.En).ToString().ToLower();

			try {
				body = GetResourceAsString("Email", localeStr, name + ".html");

				foreach (Match m in Regex.Matches(body, @"< *title *>([^<]+)< *\/ *title *>")) {
					subj = m.Groups.ElementAtOrDefault(1)?.Value ?? "";
					break;
				}
			}
			catch (Exception e) {
				_logger?.Error(e, "Failed to get template for {0}.{1}", name, localeStr);
			}

			return Task.FromResult(
				new EmailTemplate() {
					Body = body,
					Subject = subj,
				}
			);
		}

		// ---

		public string GetResourceAsString(string type, string locale, string name) {
			// ex: Goldmint.CoreLogic.Data.Templates.Email.en.SignInNotification.html
			var ret = _resources.GetValueOrDefault(
				$"Goldmint.CoreLogic.Data.Templates.{type}.{locale}.{name}",
				// fallback to the EN-resource
				_resources.GetValueOrDefault(
					$"Goldmint.CoreLogic.Data.Templates.{type}.{Locale.En.ToString().ToLower()}.{name}",
					//
					null
				)
			);
			if (ret == null) {
				throw new Exception($"Resource not found: Goldmint.CoreLogic.Data.Templates.{type}.{locale}.{name}");
			}
			return ret;
		}

		private void LoadUp() {
			var assembly = Assembly.GetExecutingAssembly();
			var resources = assembly.GetManifestResourceNames();
			foreach (var res in resources) {

				// skip incompatible extensions
				var found = false;
				foreach (var v in ValidExtensions) {
					if (res.EndsWith("." + v)) {
						found = true;
						break;
					}
				}
				if (!found) continue;
				
				using (var stream = assembly.GetManifestResourceStream(res)) {
					using (var reader = new StreamReader(stream, Encoding.UTF8)) {
						_resources.Add(res, reader.ReadToEnd());
					}
				}
			}
		}
	}
}

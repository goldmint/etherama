using FluentValidation;
using System;

namespace Etherama.CoreLogic.Services.Notification {

	public class EmailNotification : BaseNotification {

		public string Recipient { get; set; }
		public string RecipientName { get; set; }
		public string Subject { get; set; }
		public string Body { get; set; }

		public EmailNotification() : base(Common.NotificationType.Email) {
		}

		protected override void DeserializeContentFromStringInner(string data) {
			if (!Common.Json.ParseInto(data, this)) {
				throw new Exception("Failed to parse json into email notification");
			}
		}

		protected override string SerializeContentToStringInner() {
			return Common.Json.Stringify(this);
		}

		protected override void ValidateContentInner() {
			new Validator().ValidateAndThrow(this);
		}

		// ---

		internal class Validator : AbstractValidator<EmailNotification> {

			public Validator() {
				RuleFor(_ => _.Recipient).EmailAddress();
				RuleFor(_ => _.RecipientName).MinimumLength(1);
				RuleFor(_ => _.Subject).MinimumLength(1);
				RuleFor(_ => _.Body).MinimumLength(1);
			}
		}
	}
}

using FluentValidation;
using System.ComponentModel.DataAnnotations;

namespace Etherama.WebApplication.Models.API.v1.RegisterModels {

	public class RegisterModel : BaseValidableModel {

		/// <summary>
		/// Valid email /.{,256}/
		/// </summary>
		[Required]
		public string Email { get; set; }

		/// <summary>
		/// Password /.{6,128}/
		/// </summary>
		[Required]
		public string Password { get; set; }

		/// <summary>
		/// Captcha /.{1,1024}/
		/// </summary>
		[Required]
		public string Captcha { get; set; }

		// ---

		protected override FluentValidation.Results.ValidationResult ValidateFields() {
			var v = new InlineValidator<RegisterModel>() { CascadeMode = CascadeMode.StopOnFirstFailure };

			v.RuleFor(_ => _.Email)
				.EmailAddress().WithMessage("Invalid format")
				.Must(Common.ValidationRules.BeValidEmailLength).WithMessage("Invalid length")
			;

			v.RuleFor(_ => _.Password)
				.Must(Common.ValidationRules.BeValidPasswordLength).WithMessage("Invalid length")
			;

			v.RuleFor(_ => _.Captcha)
				.Must(Common.ValidationRules.BeValidCaptchaLength).WithMessage("Invalid length")
			;

			return v.Validate(this);
		}
	}

	// ---
	/*
	public class ConfirmModel : BaseValidableModel {

		/// <summary>
		/// Token
		/// </summary>
		[Required]
		public string Token { get; set; }
		
		// ---

		protected override FluentValidation.Results.ValidationResult ValidateFields() {
			var v = new InlineValidator<ConfirmModel>() { CascadeMode = CascadeMode.StopOnFirstFailure };

			v.RuleFor(_ => _.Token)
				.Must(Common.ValidationRules.BeValidConfirmationTokenLength).WithMessage("Invalid length")
			;;

			return v.Validate(this);
		}
	}
	*/

}

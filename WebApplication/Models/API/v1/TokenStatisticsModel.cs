using FluentValidation;
using System.ComponentModel.DataAnnotations;
using ValidationResult = FluentValidation.Results.ValidationResult;

namespace Etherama.WebApplication.Models.API.v1 {

	public class TokenStatisticsModel : BaseValidableModel {

		[Required]
		public long TokenId { get; set; }

		[Required]
		public string DateFrom { get; set; }

		public string DateTo { get; set; }

		protected override ValidationResult ValidateFields() {
			var v = new InlineValidator<TokenStatisticsModel>() { CascadeMode = CascadeMode.StopOnFirstFailure };

			v.RuleFor(_ => _.TokenId).Must(Common.ValidationRules.BeValidId).WithMessage("Invalid token id");

			v.RuleFor(_ => _.DateFrom).Must(Common.ValidationRules.BeValidDate).WithMessage("Invalid date from");

			v.RuleFor(_ => _.DateTo).Must(Common.ValidationRules.BeValidDate).WithMessage("Invalid date to");


			return v.Validate(this);
		}
	}
}

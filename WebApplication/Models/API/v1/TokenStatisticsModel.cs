using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Etherama.WebApplication.Models.API.v1.RegisterModels;
using FluentValidation;
using ValidationResult = FluentValidation.Results.ValidationResult;

namespace Etherama.WebApplication.Models.API.v1
{
    public class TokenStatisticsModel : BaseValidableModel
    {
        [Required]
        public long TokenId { get; set; }

        [Required]
        public string DateFrom { get; set; }

        public string DateTo { get; set; }

        protected override ValidationResult ValidateFields()
        {
            var v = new InlineValidator<TokenStatisticsModel>() { CascadeMode = CascadeMode.StopOnFirstFailure };

            v.RuleFor(_ => _.TokenId).Must(Common.ValidationRules.BeValidId).WithMessage("Invalid token id");

            v.RuleFor(_ => _.DateFrom).Must(Common.ValidationRules.BeValidDate).WithMessage("Invalid date from");

            v.RuleFor(_ => _.DateTo).Must(Common.ValidationRules.BeValidDate).WithMessage("Invalid date to");


            return v.Validate(this);
        }
    }
}

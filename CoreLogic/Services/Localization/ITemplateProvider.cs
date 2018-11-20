using System.Threading.Tasks;
using Etherama.Common;

namespace Etherama.CoreLogic.Services.Localization {

	public interface ITemplateProvider {

		Task<EmailTemplate> GetEmailTemplate(string name, Locale? locale);
	}
}

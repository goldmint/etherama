using System.Threading.Tasks;

namespace Etherama.CoreLogic.Services.RuntimeConfig {

	public interface IRuntimeConfigLoader {

		Task<string> Load();
		Task<bool> Save(string json);
	}
}

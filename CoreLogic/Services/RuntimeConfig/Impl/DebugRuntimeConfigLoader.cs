using System;
using System.Threading.Tasks;
using Etherama.CoreLogic.Services.RuntimeConfig;

namespace Etherama.CoreLogic.Services.RuntimeConfig.Impl {
#if DEBUG

	public sealed class DebugRuntimeConfigLoader : IRuntimeConfigLoader {

		private readonly RuntimeConfig _config;

		public DebugRuntimeConfigLoader() {
			_config = new RuntimeConfig();
		}

		public void EditConfig(Action<RuntimeConfig> edit) {
			edit?.Invoke(_config);
		}

		public Task<string> Load() {
			return Task.FromResult(Common.Json.Stringify(_config));
		}

		public Task<bool> Save(string json) {
			return Task.FromResult(true);
		}
	}

#endif
}

using Etherama.Common;
using Nethereum.Hex.HexTypes;
using Nethereum.Web3;
using NLog;
using System;
using System.Numerics;
using System.Threading.Tasks;
using Nethereum.RPC.Eth.DTOs;

namespace Etherama.CoreLogic.Services.Blockchain.Ethereum.Impl {

	public sealed class EthereumWriter : EthereumBaseClient {


		public EthereumWriter(AppConfig appConfig, LogFactory logFactory) : base(appConfig, logFactory) {
		}

		private Task<HexBigInteger> GetWritingGas() {
			return Task.FromResult(new HexBigInteger(0));
		}

		public async Task<string> SendTransaction(Nethereum.Contracts.Contract contract, string functionName, string from, HexBigInteger gas, HexBigInteger value, params object[] functionInput) {
			
			// TODO: name is invalid, gas is invalid
			var function = contract.GetFunction(functionName);

			Logger.Info($"Calling {functionName}() at gas {gas.Value.ToString()}");

			try {
				return await function.SendTransactionAsync(from, gas, value, functionInput);
			}
			catch (Exception e) {
				Logger.Error(e, $"Failed to call {functionName}() at gas {gas}");
			}

			return null;
		}
        
        
	}
}

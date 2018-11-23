using Etherama.Common;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.Hex.HexTypes;
using Nethereum.Web3;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;
using Etherama.Common.Extensions;
using Etherama.CoreLogic.Services.Blockchain.Ethereum.Models;
using Etherama.CoreLogic.Services.Blockchain.Ethereum.Models.ContractEvent;
using Etherama.CoreLogic.Services.Blockchain.Ethereum.Models.Event;
using Nethereum.RPC.Eth.DTOs;

namespace Etherama.CoreLogic.Services.Blockchain.Ethereum.Impl {

	public class EthereumReader : EthereumBaseClient, IEthereumReader {

		public EthereumReader(AppConfig appConfig, LogFactory logFactory) : base(appConfig, logFactory) {
		}

		// ---

		public async Task<BigInteger> GetCurrentGasPrice() {
			return await Web3Utils.GetGasPrice();
		}

		public async Task<BigInteger> GetLogsLatestBlockNumber() {
			var web3 = new Web3(EthLogsProvider);

			var syncResp = await web3.Eth.Syncing.SendRequestAsync();

			if (syncResp.IsSyncing) return syncResp.CurrentBlock;

			return await web3.Eth.Blocks.GetBlockNumber.SendRequestAsync();
		}

		public async Task<TransactionInfo> CheckTransaction(string txid, int confirmationsRequired) {

			if (string.IsNullOrWhiteSpace(txid)) {
				throw new ArgumentException("Invalid transaction format");
			}

			var web3 = new Web3(EthProvider);
			var txinfo = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txid);

		    if (txinfo == null) return new TransactionInfo{ Status = EthTransactionStatus.Pending };


		    var lastBlockNum = await web3.Eth.Blocks.GetBlockNumber.SendRequestAsync();
		    var threshold = BigInteger.One * Math.Max(2, confirmationsRequired);

		    if (
		        txinfo.BlockNumber.HexValue != null && // got into block
		        lastBlockNum.Value - txinfo.BlockNumber.Value >= threshold // wait for number of confirmation
		    ) {
		        var txBlockInfo = await web3.Eth.Blocks.GetBlockWithTransactionsHashesByNumber.SendRequestAsync(txinfo.BlockNumber);
		        var blockTimestamp = (DateTime?) null;
		        if (txBlockInfo?.Timestamp != null && txBlockInfo.Timestamp.Value > 0) {
		            blockTimestamp = DateTimeOffset.FromUnixTimeSeconds((long)txBlockInfo.Timestamp.Value).UtcDateTime;
		        }

		        // check status
		        if ((txinfo.Status?.Value ?? BigInteger.Zero) == BigInteger.One) {
		            return new TransactionInfo() {
		                Status = EthTransactionStatus.Success,
		                Time = blockTimestamp,
		            };
		        }
		        return new TransactionInfo() {
		            Status = EthTransactionStatus.Failed,
		            Time = blockTimestamp,
		        };
		    }
		    return new TransactionInfo() {
		        Status = EthTransactionStatus.Pending,
		    };

		    // assume it is pending
		}


	    public async Task<decimal> GetTokenPrice(string contactAddress)
	    {
	        var val = await Web3Utils.GetViewFunctionResult<BigInteger>(contactAddress, AppConfig.Services.Ethereum.EtheramaContractAbi, AppConfig.Services.Ethereum.TokenPriceFunctionName);

	        return val.FromWei();
	    }

	    public async Task<long> GetBuyCount(string contactAddress)
	    {
	        var val = await Web3Utils.GetViewFunctionResult<BigInteger>(contactAddress, AppConfig.Services.Ethereum.EtheramaContractAbi, AppConfig.Services.Ethereum.TokenBuyCountFunctionName);

	        return (long)val;
	    }

	    public async Task<long> GetSellCount(string contactAddress)
	    {
	        var val = await Web3Utils.GetViewFunctionResult<BigInteger>(contactAddress, AppConfig.Services.Ethereum.EtheramaContractAbi, AppConfig.Services.Ethereum.TokenSellCountFunctionName);

	        return (long)val;
        }

        public async Task<decimal> GetBonusPerShare(string contactAddress)
	    {
	        var val = await Web3Utils.GetViewFunctionResult<BigInteger>(contactAddress, AppConfig.Services.Ethereum.EtheramaContractAbi, AppConfig.Services.Ethereum.BonusPerShareFunctionName);

	        return val.FromWei();
	    }
    }
}

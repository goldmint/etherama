using Etherama.Common;
using System;

namespace Etherama.CoreLogic.Services.Blockchain.Ethereum.Models {

	public sealed class TransactionInfo {

		public EthTransactionStatus Status { get; internal set; }
		public DateTime? Time { get; internal set; }
	}
}

using Etherama.Common;
using System.Numerics;
using System.Threading.Tasks;

namespace Etherama.CoreLogic.Services.Blockchain.Ethereum {

	public interface IEthereumWriter
	{
	    Task<string> UpdateMaxGaxPrice(BigInteger gasPrice);
	}
}
